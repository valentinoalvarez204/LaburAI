import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AI_PROVIDER_TOKEN } from '../ai/ai.module';
import type { IAPIService } from '../ai/interfaces/ia-service.interface';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApplicationsService {
  private readonly MAX_EMPRESA_MATCH_ANALYSES = 5;

  constructor(
    private prisma: PrismaService,
    @Inject(AI_PROVIDER_TOKEN) private aiService: IAPIService,
    private notificationsService: NotificationsService,
  ) { }

  // Postularse a una oferta
  async create(usuarioId: string, data: {
    ofertaId: string;
    cartaMotivacion?: string;
  }) {
    // Buscar el perfil de candidato asociado a este usuario
    const candidato = await this.prisma.candidato.findUnique({
      where: { usuarioId }
    });
    if (!candidato) throw new NotFoundException('Perfil de candidato no encontrado');

    // Verificar que la oferta existe y está vigente
    const oferta = await this.prisma.ofertaLaboral.findUnique({
      where: { id: data.ofertaId },
    });
    if (!oferta) throw new NotFoundException('Oferta no encontrada');
    const vencida = oferta.fechaLimite && oferta.fechaLimite < new Date();
    if (oferta.esBorrador || vencida) throw new BadRequestException('Esta oferta no está disponible');

    // Verificar que no se haya postulado antes
    const yaPostulado = await this.prisma.postulacion.findUnique({
      where: {
        candidatoId_ofertaId: {
          candidatoId: candidato.id,
          ofertaId: data.ofertaId,
        },
      },
    });
    if (yaPostulado) throw new BadRequestException('Ya te postulaste a esta oferta');

    return this.prisma.postulacion.create({
      data: {
        candidatoId: candidato.id,
        ofertaId: data.ofertaId,
        cartaMotivacion: data.cartaMotivacion,
        estado: 'PENDIENTE', // siempre forzado al crear
      },
      include: {
        oferta: {
          select: { titulo: true, empresa: { select: { nombre: true, logoUrl: true } } },
        },
      },
    });
  }

  // Ver postulaciones de un candidato
  async findByCandidato(candidatoId: string) {
    return this.prisma.postulacion.findMany({
      where: { candidatoId },
      include: {
        oferta: {
          include: {
            empresa: { select: { nombre: true, ubicacion: true, logoUrl: true } },
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async analizarMatchEmpresa(postulacionId: string, usuarioId: string) {
    const empresa = await this.prisma.empresa.findUnique({ where: { usuarioId } });
    if (!empresa) {
      throw new ForbiddenException('Solo las empresas pueden analizar matching de postulaciones');
    }

    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id: postulacionId },
      include: {
        candidato: true,
        oferta: true,
      },
    });
    if (!postulacion) throw new NotFoundException('Postulación no encontrada');
    if (postulacion.oferta.empresaId !== empresa.id) {
      throw new ForbiddenException('No podés analizar postulaciones de otra empresa');
    }

    if (postulacion.matchAnalizadoEmpresa && postulacion.matchIA !== null) {
      const usados = await this.countEmpresaMatchAnalyses(empresa.id);
      return {
        match: postulacion.matchIA,
        analizado: true,
        analisisUsados: usados,
        analisisRestantes: Math.max(0, this.MAX_EMPRESA_MATCH_ANALYSES - usados),
      };
    }

    const usados = await this.countEmpresaMatchAnalyses(empresa.id);
    if (usados >= this.MAX_EMPRESA_MATCH_ANALYSES) {
      throw new BadRequestException(`Solo podés analizar matching con IA ${this.MAX_EMPRESA_MATCH_ANALYSES} veces`);
    }

    const candidatoTexto = [
      `Habilidades: ${postulacion.candidato.habilidades.join(', ') || 'Sin habilidades cargadas'}`,
      `Resumen: ${postulacion.candidato.resumenIA || 'Sin resumen disponible'}`,
      `Formación: ${postulacion.candidato.formacion.join(', ') || 'No especificada'}`,
    ].join('. ');
    const ofertaTexto = [
      `Rol: ${postulacion.oferta.titulo}`,
      `Requisitos: ${postulacion.oferta.descripcion}`,
      `Habilidades requeridas: ${postulacion.oferta.habilidades.join(', ') || 'No especificadas'}`,
      `Experiencia: ${postulacion.oferta.experiencia || 'No especificada'}`,
      `Estudios: ${postulacion.oferta.estudios || 'No especificados'}`,
    ].join('. ');

    const score = await this.aiService.calcularMatch(candidatoTexto, ofertaTexto);
    const normalized = Math.max(0, Math.min(100, Math.round(score || 0)));

    const updated = await this.prisma.postulacion.update({
      where: { id: postulacionId },
      data: {
        matchIA: normalized,
        matchAnalizadoEmpresa: true,
        matchAnalizadoEn: new Date(),
      },
    });

    return {
      match: updated.matchIA,
      analizado: true,
      analisisUsados: usados + 1,
      analisisRestantes: Math.max(0, this.MAX_EMPRESA_MATCH_ANALYSES - (usados + 1)),
    };
  }

  private countEmpresaMatchAnalyses(empresaId: string) {
    return this.prisma.postulacion.count({
      where: {
        matchAnalizadoEmpresa: true,
        oferta: { empresaId },
      },
    });
  }

  // Ver postulaciones de una oferta (para empresas)
  async findByOferta(ofertaId: string) {
    return this.prisma.postulacion.findMany({
      where: { ofertaId },
      include: {
        candidato: {
          select: {
            nombre: true,
            apellido: true,
            ubicacion: true,
            habilidades: true,
            scoreCV: true,
            cvUrl: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  // Actualizar una postulación (estado o notes)
  async update(id: string, data: { estado?: 'PENDIENTE' | 'REVISADA' | 'ENTREVISTA' | 'RECHAZADA', notes?: string }) {
    const updated = await this.prisma.postulacion.update({
      where: { id },
      data,
      include: {
        candidato: true,
        oferta: { select: { titulo: true } },
      },
    });

    if (data.estado) {
      const statusLabels = {
        PENDIENTE: 'en revisión',
        REVISADA: 'revisada',
        ENTREVISTA: 'seleccionada para entrevista',
        RECHAZADA: 'rechazada',
      };

      await this.notificationsService.create({
        usuarioId: updated.candidato.usuarioId,
        titulo: 'Actualización de postulación',
        mensaje: `Tu postulación para "${updated.oferta.titulo}" ha sido ${statusLabels[data.estado]}.`,
        tipo: data.estado === 'RECHAZADA' ? 'alert' : 'success',
        link: `/pages/dashboard-candidato.html?section=postulaciones&id=${updated.id}`,
      });
    }

    return updated;
  }

  // Ver una postulación específica
  async findOne(id: string) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id },
      include: {
        candidato: {
          include: {
            usuario: { select: { email: true } }
          }
        },
        oferta: {
          include: {
            empresa: { select: { nombre: true, id: true, logoUrl: true } }
          }
        }
      }
    });
    if (!postulacion) throw new NotFoundException('Postulación no encontrada');
    return postulacion;
  }
}
