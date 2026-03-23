import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // POST /api/applications — requiere token
  @Post()
  @UseGuards(JwtGuard)
  create(@Body() body: {
    candidatoId: string;
    ofertaId: string;
    cartaMotivacion?: string;
  }) {
    return this.applicationsService.create(body);
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

  // PATCH /api/applications/:id/estado
  @Patch(':id/estado')
  updateEstado(
    @Param('id') id: string,
    @Body() body: { estado: 'PENDIENTE' | 'REVISADA' | 'ENTREVISTA' | 'RECHAZADA' },
  ) {
    return this.applicationsService.updateEstado(id, body.estado);
  }
}