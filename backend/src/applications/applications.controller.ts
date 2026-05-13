import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // POST /api/applications — requiere token
  @Post()
  @UseGuards(JwtGuard)
  create(
    @Req() req: any,
    @Body() body: {
      ofertaId: string;
      cartaMotivacion?: string;
    }
  ) {
    if (req.user?.rol === 'EMPRESA') {
      throw new ForbiddenException('Las empresas no pueden postularse a ofertas.');
    }
    return this.applicationsService.create(req.user.sub, body);
  }

  // GET /api/applications?candidatoId=XXX
  @Get()
  findAll(
    @Query('candidatoId') candidatoId?: string,
    @Query('ofertaId')    ofertaId?: string,
  ) {
    if (candidatoId) return this.applicationsService.findByCandidato(candidatoId);
    if (ofertaId)    return this.applicationsService.findByOferta(ofertaId);
    return [];
  }

  // GET /api/applications/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  // POST /api/applications/:id/match — análisis IA pedido por empresa
  @Post(':id/match')
  @UseGuards(JwtGuard)
  analyzeMatch(@Param('id') id: string, @Req() req: any) {
    if (req.user?.rol !== 'EMPRESA') {
      throw new ForbiddenException('Solo las empresas pueden analizar matching de postulaciones');
    }
    return this.applicationsService.analizarMatchEmpresa(id, req.user.sub);
  }

  // PATCH /api/applications/:id — solo empresas autenticadas
  @Patch(':id')
  @UseGuards(JwtGuard)
  update(
    @Param('id') id: string,
    @Body() body: { estado?: 'PENDIENTE' | 'REVISADA' | 'ENTREVISTA' | 'RECHAZADA', notes?: string },
  ) {
    return this.applicationsService.update(id, body);
  }
}
