import { Controller, Get, Param } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getStats() {
    return this.statsService.getGlobalStats();
  }

  @Get('empresa/:id')
  getEmpresaStats(@Param('id') id: string) {
    return this.statsService.getEmpresaStats(id);
  }

  @Get('candidato/:id')
  getCandidatoStats(@Param('id') id: string) {
    return this.statsService.getCandidatoStats(id);
  }
}

