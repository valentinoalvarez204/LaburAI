import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getGlobalStats() {
    const [candidatos, ofertas, empresas, matchAgg] = await Promise.all([
      this.prisma.candidato.count(),
      this.prisma.ofertaLaboral.count({ where: { activa: true } }),
      this.prisma.empresa.count(),
      this.prisma.postulacion.aggregate({
        _avg: { matchIA: true },
      }),
    ]);

    return {
      candidatos,
      ofertas,
      empresas,
      matchPromedio: Math.round(matchAgg._avg.matchIA || 0),
    };
  }

  async getEmpresaStats(usuarioId: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { usuarioId },
    });
    if (!empresa) {
      return { ofertasActivas: 0, totalPostulaciones: 0, entrevistas: 0, rechazadas: 0 };
    }
    const empresaId = empresa.id;

    const [ofertasActivas, totalPostulaciones, entrevistas, rechazadas] = await Promise.all([
      this.prisma.ofertaLaboral.count({
        where: { empresaId, activa: true },
      }),
      this.prisma.postulacion.count({
        where: { oferta: { empresaId } },
      }),
      this.prisma.postulacion.count({
        where: { oferta: { empresaId }, estado: 'ENTREVISTA' },
      }),
      this.prisma.postulacion.count({
        where: { oferta: { empresaId }, estado: 'RECHAZADA' },
      }),
    ]);

    return {
      ofertasActivas,
      totalPostulaciones,
      entrevistas,
      rechazadas,
    };
  }

  async getCandidatoStats(usuarioId: string) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { usuarioId },
    });
    if (!candidato) {
      return { totalPostulaciones: 0, pendientes: 0, entrevistas: 0, rechazadas: 0 };
    }
    const candidatoId = candidato.id;

    const [totalPostulaciones, pendientes, entrevistas, rechazadas] = await Promise.all([
      this.prisma.postulacion.count({ where: { candidatoId } }),
      this.prisma.postulacion.count({ where: { candidatoId, estado: 'PENDIENTE' } }),
      this.prisma.postulacion.count({ where: { candidatoId, estado: 'ENTREVISTA' } }),
      this.prisma.postulacion.count({ where: { candidatoId, estado: 'RECHAZADA' } }),
    ]);

    return {
      totalPostulaciones,
      pendientes,
      entrevistas,
      rechazadas,
    };
  }
}

