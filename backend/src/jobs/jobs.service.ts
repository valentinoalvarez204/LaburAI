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
    const ahora = new Date();
    const vencida = oferta.fechaLimite && oferta.fechaLimite < ahora;
    const estado = oferta.esBorrador ? 'BORRADOR' : (vencida ? 'CERRADA' : 'ACTIVA');
    return { ...oferta, estado };
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