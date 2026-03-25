import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getGlobalStats() {
    const [candidatos, ofertas, empresas, matchAgg] = await Promise.all([
      this.prisma.usuario.count({ where: { rol: 'CANDIDATO' } }),
      this.prisma.ofertaLaboral.count({ where: { activa: true } }),
      this.prisma.usuario.count({ where: { rol: 'EMPRESA' } }),
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

  async getEmpresaStats(empresaId: string) {
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

  async getCandidatoStats(candidatoId: string) {
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

