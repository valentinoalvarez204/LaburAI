import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getEmpresaStats(usuarioId: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { usuarioId },
    });
    if (!empresa) throw new Error('Empresa no encontrada');

    const ofertasActivas = await this.prisma.ofertaLaboral.count({
      where: {
        empresaId: empresa.id,
        esBorrador: false,
        OR: [{ fechaLimite: null }, { fechaLimite: { gte: new Date() } }],
      },
    });

    const postulaciones = await this.prisma.postulacion.count({
      where: {
        oferta: {
          empresaId: empresa.id,
        },
      },
    });

    const entrevistas = await this.prisma.entrevista.count({
      where: {
        fecha: {
          gte: new Date(),
        },
        postulacion: {
          oferta: {
            empresaId: empresa.id,
          },
        },
      },
    });

    return {
      ofertasActivas,
      postulaciones,
      entrevistas,
    };
  }
}
