import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // GET /api/jobs
  @Get()
  findAll(
    @Query('q')         q?: string,
    @Query('rubro')     rubro?: string,
    @Query('modalidad') modalidad?: string,
    @Query('ubicacion') ubicacion?: string,
    @Query('empresaId') empresaId?: string,
  ) {
    return this.jobsService.findAll({ q, rubro, modalidad, ubicacion, empresaId });
  }

  // GET /api/jobs/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  // POST /api/jobs — requiere token
  @Post()
  @UseGuards(JwtGuard)
  create(@Body() body: {
    titulo: string;
    descripcion: string;
    rubro: string;
    modalidad: string;
    ubicacion: string;
    jornada: string;
    experiencia?: string;
    estudios?: string;
    salarioMin?: number;
    salarioMax?: number;
    habilidades?: string[];
    empresaId: string;
  }) {
    return this.jobsService.create(body);
  }
}