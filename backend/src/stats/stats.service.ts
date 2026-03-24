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
}
