import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AI_PROVIDER_TOKEN } from '../ai/ai.module';
import type { IAPIService } from '../ai/interfaces/ia-service.interface';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    @Inject(AI_PROVIDER_TOKEN) private aiService: IAPIService,
  ) { }

  // Obtener todas las ofertas activas (con filtros opcionales)
  async findAll(filtros?: {
    q?: string;
    rubro?: string;
    modalidad?: string;
    ubicacion?: string;
    empresaId?: string;
  }) {
    const where: any = {};

    if (!filtros?.empresaId) {
      where.esBorrador = false;
      where.OR = [
        { fechaLimite: null },
        { fechaLimite: { gte: new Date() } }
      ];
    } else {
      where.empresaId = filtros.empresaId;
    }

    if (filtros?.rubro) { where.rubro = { contains: filtros.rubro, mode: 'insensitive' }; }
    if (filtros?.modalidad) { where.modalidad = { contains: filtros.modalidad, mode: 'insensitive' }; }
    if (filtros?.ubicacion) { where.ubicacion = { contains: filtros.ubicacion, mode: 'insensitive' }; }
    if (filtros?.q) {
      const searchOR = [
        { titulo: { contains: filtros.q, mode: 'insensitive' } },
        { descripcion: { contains: filtros.q, mode: 'insensitive' } },
        { rubro: { contains: filtros.q, mode: 'insensitive' } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    const ofertas = await this.prisma.ofertaLaboral.findMany({
      where,
      include: {
        empresa: {
          select: { nombre: true, industria: true, ubicacion: true },
        },
        postulaciones: {
          select: { id: true, estado: true },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    const ahora = new Date();
    return ofertas.map(o => {
      const vencida = o.fechaLimite && o.fechaLimite < ahora;
      const estado = o.esBorrador ? 'BORRADOR' : (vencida ? 'CERRADA' : 'ACTIVA');
      return { ...o, estado };
    });
  }

  // Obtener una oferta por ID
  async findOne(id: string, candidatoId?: string) {
    const oferta = await this.prisma.ofertaLaboral.findUnique({
      where: { id },
      include: {
        empresa: true,
        postulaciones: {
          select: { id: true },
        },
      },
    });
    if (!oferta) throw new NotFoundException('Oferta no encontrada');

    const ahora = new Date();
    const vencida = oferta.fechaLimite && oferta.fechaLimite < ahora;
    const estado = oferta.esBorrador ? 'BORRADOR' : (vencida ? 'CERRADA' : 'ACTIVA');

    const response: any = { ...oferta, estado };

    if (candidatoId) {
      const candidato = await this.prisma.candidato.findUnique({ where: { id: candidatoId } });
      if (candidato) {
        const totalAnalyses = await this.prisma.matchAnalisis.count({ where: { candidatoId } });
        const existingAnalysis = await this.prisma.matchAnalisis.findUnique({
          where: { candidatoId_ofertaId: { candidatoId, ofertaId: id } },
        });

        response.matchIA = existingAnalysis?.match ?? 0;
        response.analizado = !!existingAnalysis;
        response.analisisRestantes = Math.max(0, 3 - totalAnalyses);
      } else {
        response.matchIA = 0;
        response.analizado = false;
        response.analisisRestantes = 3;
      }
    }

    return response;
  }

  async analizarMatch(ofertaId: string, usuarioId: string) {
    const candidato = await this.prisma.candidato.findUnique({ where: { usuarioId } });
    if (!candidato) {
      throw new ForbiddenException('Solo los candidatos pueden analizar match con IA');
    }
    const candidatoId = candidato.id;

    const oferta = await this.prisma.ofertaLaboral.findUnique({ where: { id: ofertaId } });
    if (!oferta) throw new NotFoundException('Oferta no encontrada');

    const existing = await this.prisma.matchAnalisis.findUnique({
      where: { candidatoId_ofertaId: { candidatoId, ofertaId } },
    });
    if (existing) {
      throw new BadRequestException('Ya analizaste esta oferta con IA');
    }

    const totalAnalyses = await this.prisma.matchAnalisis.count({ where: { candidatoId } });
    if (totalAnalyses >= 3) {
      throw new BadRequestException('Solo podés analizar match con IA 3 veces');
    }

    const candidatoTexto = `Habilidades: ${candidato.habilidades.join(', ')}. Resumen: ${candidato.resumenIA || 'Sin resumen disponible'}.`;
    const ofertaTexto = `Rol: ${oferta.titulo}. Requisitos: ${oferta.descripcion}. Habilidades requeridas: ${oferta.habilidades.join(', ')}. Experiencia: ${oferta.experiencia || 'No especificada'}. Estudios: ${oferta.estudios || 'No especificados'}.`;

    const score = await this.aiService.calcularMatch(candidatoTexto, ofertaTexto);
    const normalized = Math.max(0, Math.min(100, Math.round(score || 0)));

    const matchAnalisis = await this.prisma.matchAnalisis.create({
      data: {
        candidatoId,
        ofertaId,
        match: normalized,
      },
    });

    return {
      match: matchAnalisis.match,
      analizado: true,
      analisisRestantes: Math.max(0, 3 - (totalAnalyses + 1)),
    };
  }

  // PREVIEW: Calcula el match para un candidato sin obligarlo a postularse
  async calcularMatchPreview(ofertaId: string, usuarioId: string): Promise<{ match: number }> {
    const candidato = await this.prisma.candidato.findUnique({
      where: { usuarioId }
    });
    
    if (!candidato) {
      throw new ForbiddenException('Solo los candidatos pueden calcular su compatibilidad');
    }

    const oferta = await this.prisma.ofertaLaboral.findUnique({
      where: { id: ofertaId }
    });

    if (!oferta) throw new NotFoundException('Oferta no encontrada');

    const candidatoTexto = `Habilidades: ${candidato.habilidades.join(', ')}. Resumen: ${candidato.resumenIA || 'Sin resumen'}`;
    const ofertaTexto = `Rol: ${oferta.titulo}. Requisitos: ${oferta.descripcion}. Habilidades requeridas: ${oferta.habilidades.join(', ')}`;
    
    const score = await this.aiService.calcularMatch(candidatoTexto, ofertaTexto);
    return { match: score };
  }

  // Crear una oferta (solo empresas)
  async create(data: {
    titulo: string;
    descripcion: string;
    rubro: string;
    modalidad: string;
    ubicacion: string;
    jornada: string;
    vacantes?: number;
    fechaLimite?: string;
    experiencia?: string;
    estudios?: string;
    salarioMin?: number;
    salarioMax?: number;
    habilidades?: string[];
    responsabilidades?: string[];
    beneficios?: string[];
    esBorrador?: boolean;
  }, usuarioId: string) {
    
    const empresa = await this.prisma.empresa.findUnique({
      where: { usuarioId }
    });

    if (!empresa) {
      throw new ForbiddenException('Perfil de empresa no encontrado');
    }

    const fechaParseada = data.fechaLimite ? new Date(data.fechaLimite) : undefined;

    return this.prisma.ofertaLaboral.create({
      data: {
        ...data,
        esBorrador: data.esBorrador ?? false,
        fechaLimite: fechaParseada,
        empresaId: empresa.id,
      },
      include: {
        empresa: { select: { nombre: true } },
      },
    });
  }

  // Editar una oferta (verifica que el usuario sea dueño de la empresa)
  async update(id: string, data: Partial<{
    titulo: string;
    descripcion: string;
    rubro: string;
    modalidad: string;
    ubicacion: string;
    jornada: string;
    vacantes: number;
    fechaLimite: string;
    experiencia: string;
    estudios: string;
    salarioMin: number;
    salarioMax: number;
    habilidades: string[];
    responsabilidades: string[];
    beneficios: string[];
    esBorrador: boolean;
  }>, usuarioId: string) {
    await this.assertOwnership(id, usuarioId);

    const updateData: any = { ...data };
    if (data.fechaLimite) {
      updateData.fechaLimite = new Date(data.fechaLimite);
    }
    
    return this.prisma.ofertaLaboral.update({
      where: { id },
      data: updateData,
    });
  }

  // Cerrar una oferta (estableciendo la fechaLimite como la fecha actual)
  async close(id: string, usuarioId: string) {
    await this.assertOwnership(id, usuarioId);
    return this.prisma.ofertaLaboral.update({
      where: { id },
      data: { fechaLimite: new Date() },
    });
  }

  // Verifica que la oferta pertenezca a la empresa del usuario autenticado
  private async assertOwnership(ofertaId: string, usuarioId: string) {
    const oferta = await this.prisma.ofertaLaboral.findUnique({
      where: { id: ofertaId },
      include: { empresa: true },
    });
    if (!oferta) throw new NotFoundException('Oferta no encontrada');
    if (oferta.empresa.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tenés permiso para modificar esta oferta');
    }
  }
}
