import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  // Obtener perfil del candidato
  async getCandidato(candidatoId: string) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { id: candidatoId },
      include: {
        usuario: { select: { email: true, rol: true } },
        postulaciones: {
          include: {
            oferta: {
              include: {
                empresa: { select: { nombre: true } },
              },
            },
          },
          orderBy: { creadoEn: 'desc' },
        },
      },
    });
    if (!candidato) throw new NotFoundException('Candidato no encontrado');
    return candidato;
  }

  // Actualizar perfil del candidato
  async updateCandidato(candidatoId: string, data: {
    nombre?:    string;
    apellido?:  string;
    ubicacion?: string;
    telefono?:  string;
    linkedin?:  string;
  }) {
    return this.prisma.candidato.update({
      where: { id: candidatoId },
      data,
    });
  }

  // Obtener perfil de la empresa
  async getEmpresa(empresaId: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
      include: {
        usuario: { select: { email: true } },
        ofertas: {
          include: {
            postulaciones: { select: { id: true } },
          },
          orderBy: { creadoEn: 'desc' },
        },
      },
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return empresa;
  }

  // Actualizar perfil de la empresa
  async updateEmpresa(empresaId: string, data: {
    nombre?:      string;
    industria?:   string;
    descripcion?: string;
    ubicacion?:   string;
    sitioWeb?:    string;
  }) {
    return this.prisma.empresa.update({
      where: { id: empresaId },
      data,
    });
  }
}