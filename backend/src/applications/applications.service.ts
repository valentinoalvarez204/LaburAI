import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AI_PROVIDER_TOKEN } from '../ai/ai.module';
import type { IAPIService } from '../ai/interfaces/ia-service.interface';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(AI_PROVIDER_TOKEN) private aiService: IAPIService,
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

    // Calcular match usando la IA de forma óptima
    console.log('Calculando match...');
    const candidatoTexto = `Habilidades: ${candidato.habilidades.join(', ')}. Resumen: ${candidato.resumenIA || 'Sin resumen'}`;
    const ofertaTexto = `Rol: ${oferta.titulo}. Requisitos: ${oferta.descripcion}. Habilidades deseadas: ${oferta.habilidades.join(', ')}`;
    const matchScore = await this.aiService.calcularMatch(candidatoTexto, ofertaTexto);
    console.log('Match calculado:', matchScore);

    return this.prisma.postulacion.create({
      data: {
        candidatoId: candidato.id,
        ofertaId: data.ofertaId,
        cartaMotivacion: data.cartaMotivacion,
        estado: 'PENDIENTE', // siempre forzado al crear
        matchIA: matchScore,
      },
      include: {
        oferta: {
          select: { titulo: true, empresa: { select: { nombre: true } } },
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
            empresa: { select: { nombre: true, ubicacion: true } },
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
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
    return this.prisma.postulacion.update({
      where: { id },
      data,
    });
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
            empresa: { select: { nombre: true, id: true } }
          }
        }
      }
    });
    if (!postulacion) throw new NotFoundException('Postulación no encontrada');
    return postulacion;
  }
}