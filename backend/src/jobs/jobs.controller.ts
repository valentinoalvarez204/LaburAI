import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  // GET /api/jobs
  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('rubro') rubro?: string,
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

  // POST /api/jobs — solo empresas autenticadas
  @Post()
  @UseGuards(JwtGuard)
  async create(@Body() body: CreateJobDto, @Req() req: any) {
    if (req.user.rol !== 'EMPRESA') {
      throw new ForbiddenException('Solo las empresas pueden publicar ofertas');
    }
    return this.jobsService.create(body, req.user.sub);
  }

  // PATCH /api/jobs/:id — editar oferta (solo la empresa dueña)
  @Patch(':id')
  @UseGuards(JwtGuard)
  update(
    @Param('id') id: string,
    @Body() body: UpdateJobDto,
    @Req() req: any,
  ) {
    return this.jobsService.update(id, body, req.user.sub);
  }

  // PATCH /api/jobs/:id/cerrar — cerrar oferta (solo la empresa dueña)
  @Patch(':id/cerrar')
  @UseGuards(JwtGuard)
  cerrar(@Param('id') id: string, @Req() req: any) {
    return this.jobsService.close(id, req.user.sub);
  }
}