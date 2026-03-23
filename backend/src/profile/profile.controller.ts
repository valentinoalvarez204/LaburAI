import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtGuard } from '../auth/jwt.guard';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /api/profile/candidato/:id
  @Get('candidato/:id')
  @UseGuards(JwtGuard)
  getCandidato(@Param('id') id: string) {
    return this.profileService.getCandidato(id);
  }

  // PATCH /api/profile/candidato/:id
  @Patch('candidato/:id')
  @UseGuards(JwtGuard)
  updateCandidato(
    @Param('id') id: string,
    @Body() body: {
      nombre?:    string;
      apellido?:  string;
      ubicacion?: string;
      telefono?:  string;
      linkedin?:  string;
    },
  ) {
    return this.profileService.updateCandidato(id, body);
  }

  // POST /api/profile/candidato/:id/cv — sube el CV en PDF
  @Post('candidato/:id/cv')
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: './uploads/cvs',
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `cv-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Solo se aceptan archivos PDF'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async uploadCv(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    const cvUrl = `/uploads/cvs/${file.filename}`;
    return this.profileService.updateCvUrl(id, cvUrl);
  }

  // GET /api/profile/empresa/:id
  @Get('empresa/:id')
  @UseGuards(JwtGuard)
  getEmpresa(@Param('id') id: string) {
    return this.profileService.getEmpresa(id);
  }

  // PATCH /api/profile/empresa/:id
  @Patch('empresa/:id')
  @UseGuards(JwtGuard)
  updateEmpresa(
    @Param('id') id: string,
    @Body() body: {
      nombre?:      string;
      industria?:   string;
      descripcion?: string;
      ubicacion?:   string;
      sitioWeb?:    string;
    },
  ) {
    return this.profileService.updateEmpresa(id, body);
  }
}