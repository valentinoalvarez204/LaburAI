import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getStats() {
    return this.statsService.getGlobalStats();
  }

  @UseGuards(JwtGuard)
  @Get('empresa')
  getEmpresaStats(@Req() req) {
    // req.user.sub is the usuarioId
    return this.statsService.getEmpresaStats(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Get('candidato')
  getCandidatoStats(@Req() req) {
    // req.user.sub is the usuarioId
    return this.statsService.getCandidatoStats(req.user.sub);
  }
}

