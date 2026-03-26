import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { EntrevistasService } from './entrevistas.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('entrevistas')
@UseGuards(JwtGuard)
export class EntrevistasController {
  constructor(private readonly entrevistasService: EntrevistasService) {}

  @Post()
  create(@Body() body: { fecha: string; linkReunion?: string; postulacionId: string }) {
    return this.entrevistasService.create({
      fecha: new Date(body.fecha),
      linkReunion: body.linkReunion,
      postulacionId: body.postulacionId,
    });
  }

  @Get()
  findAll() {
    return this.entrevistasService.findAll();
  }

  @Get('empresa')
  findAllByEmpresa(@Req() req: any) {
    return this.entrevistasService.findAllByEmpresa(req.user.sub);
  }
}
