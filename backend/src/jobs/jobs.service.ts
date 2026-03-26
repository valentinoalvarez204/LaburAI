import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) { }

  // Obtener todas las ofertas activas (con filtros opcionales)
  async findAll(filtros?: {
    q?: string;
    rubro?: string;
    modalidad?: string;
    ubicacion?: string;
    empresaId?: string;
  }) {
    const where: any = { activa: true };

    if (filtros?.rubro) { where.rubro = { contains: filtros.rubro, mode: 'insensitive' }; }
    if (filtros?.modalidad) { where.modalidad = { contains: filtros.modalidad, mode: 'insensitive' }; }
    if (filtros?.ubicacion) { where.ubicacion = { contains: filtros.ubicacion, mode: 'insensitive' }; }
    if (filtros?.empresaId) { where.empresaId = filtros.empresaId; }
    if (filtros?.q) {
      where.OR = [
        { titulo: { contains: filtros.q, mode: 'insensitive' } },
        { descripcion: { contains: filtros.q, mode: 'insensitive' } },
        { rubro: { contains: filtros.q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.ofertaLaboral.findMany({
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
  }

  // Obtener una oferta por ID
  async findOne(id: string) {
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
    return oferta;
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

  // Cerrar una oferta (verifica que el usuario sea dueño de la empresa)
  async close(id: string, usuarioId: string) {
    await this.assertOwnership(id, usuarioId);
    return this.prisma.ofertaLaboral.update({
      where: { id },
      data: { activa: false },
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