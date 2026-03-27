import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EntrevistasService {
  constructor(private prisma: PrismaService) {}

  async create(data: { fecha: Date; linkReunion?: string; postulacionId: string }) {
    const entrevista = await this.prisma.entrevista.create({
      data: {
        fecha: new Date(data.fecha),
        linkReunion: data.linkReunion,
        postulacionId: data.postulacionId,
      },
    });

    await this.prisma.postulacion.update({
      where: { id: data.postulacionId },
      data: { estado: 'ENTREVISTA' },
    });

    return entrevista;
  }

  async findAll() {
    return this.prisma.entrevista.findMany({
      include: {
        postulacion: {
          include: { candidato: true, oferta: true },
        },
      },
    });
  }

  async findAllByEmpresa(usuarioId: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { usuarioId },
    });
    if (!empresa) throw new Error('Empresa no encontrada');

    return this.prisma.entrevista.findMany({
      where: {
        postulacion: {
          oferta: { empresaId: empresa.id },
        },
      },
      include: {
        postulacion: {
          include: { candidato: true, oferta: true },
        },
      },
    });
  }
}
