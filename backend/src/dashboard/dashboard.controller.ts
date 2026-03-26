import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('dashboard')
@UseGuards(JwtGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('empresa')
  getEmpresaStats(@Req() req: any) {
    return this.dashboardService.getEmpresaStats(req.user.sub);
  }
}
