import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  // Obtener todas las ofertas activas
async findAll(filtros?: {
    q?: string;
    rubro?: string;
    modalidad?: string;
    ubicacion?: string;
    empresaId?: string;        // ← agregar esto
  }) {
    const where: any = { activa: true };

    if (filtros?.rubro)     { where.rubro     = { contains: filtros.rubro,     mode: 'insensitive' }; }
    if (filtros?.modalidad) { where.modalidad  = { contains: filtros.modalidad, mode: 'insensitive' }; }
    if (filtros?.ubicacion) { where.ubicacion  = { contains: filtros.ubicacion, mode: 'insensitive' }; }
    if (filtros?.empresaId) { where.empresaId  = filtros.empresaId; }   // ← agregar esto
    if (filtros?.q) {
      where.OR = [
        { titulo:      { contains: filtros.q, mode: 'insensitive' } },
        { descripcion: { contains: filtros.q, mode: 'insensitive' } },
        { rubro:       { contains: filtros.q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.ofertaLaboral.findMany({
      where,
      include: {
        empresa: {
          select: { nombre: true, industria: true, ubicacion: true },
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
    experiencia?: string;
    estudios?: string;
    salarioMin?: number;
    salarioMax?: number;
    habilidades?: string[];
    empresaId: string;
  }) {
    return this.prisma.ofertaLaboral.create({
      data,
      include: {
        empresa: {
          select: { nombre: true },
        },
      },
    });
  }

  // Cerrar una oferta
  async close(id: string) {
    return this.prisma.ofertaLaboral.update({
      where: { id },
      data: { activa: false },
    });
  }
}