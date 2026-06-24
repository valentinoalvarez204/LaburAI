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
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtGuard } from '../auth/jwt.guard';
import { ProfileService } from './profile.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';
import { extraerTextoPdf } from '../ai/utils/pdf-parser.util';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly storageService: SupabaseStorageService,
  ) {}

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
      nombre?:            string;
      apellido?:          string;
      ubicacion?:         string;
      telefono?:          string;
      linkedin?:          string;
      areaRubro?:         string;
      modalidadBuscada?:  string;
      pretensionSalarial?: string;
      favoritos?:         string[];
      fotoUrl?:           string;
    },
  ) {
    return this.profileService.updateCandidato(id, body);
  }

  // POST /api/profile/candidato/:id/foto — sube la foto de perfil
  @Post('candidato/:id/foto')
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          return cb(new BadRequestException('Solo se aceptan imágenes JPG, PNG o WebP'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadCandidatoFoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se recibió ninguna imagen');

    const fotoUrl = await this.storageService.subirFotoPerfil(
      file.buffer,
      file.originalname,
      id,
      file.mimetype,
    );

    if (!fotoUrl) throw new BadRequestException('No se pudo subir la foto');

    await this.profileService.updateCandidatoFoto(id, fotoUrl);

    return { fotoUrl, message: 'Foto subida correctamente' };
  }

  // POST /api/profile/candidato/:id/cv — sube el CV en PDF
  @Post('candidato/:id/cv')
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: memoryStorage(),
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

    // 1. Primero extraemos el texto directamente de memoria (sin archivo local)
    let textoPdf = '';
    try {
      console.log('Extrayendo texto del PDF desde buffer...');
      textoPdf = await extraerTextoPdf(file.buffer);
      console.log('Texto extraído correctamente (longitud:', textoPdf.length, ')');
    } catch (error) {
      console.error('Error extrayendo texto del PDF:', error);
    }

    // 2. Subimos a Supabase Storage mandando el buffer
    const cvUrl = await this.storageService.subirCV(file.buffer, file.originalname, id);

    // 3. Guardamos la URL pública en la DB
    await this.profileService.updateCvUrl(id, cvUrl);

    // 4. Procesamos con IA usando el texto ya extraído
    if (textoPdf) {
      try {
        console.log('Enviando a procesar con IA...');
        await this.profileService.procesarCVConIA(id, textoPdf);
        console.log('Procesamiento con IA completado');
      } catch (error) {
        console.error('Error procesando IA al subir CV:', error);
      }
    }

    return { id, cvUrl, message: 'CV subido a Supabase Storage y procesado con IA exitosamente' };
  }

  // POST /api/profile/candidato/:id/re-analyze
  @Post('candidato/:id/re-analyze')
  @UseGuards(JwtGuard)
  async reAnalyzeCv(@Param('id') id: string) {
    const candidato = await this.profileService.getCandidato(id);
    if (!candidato.cvUrl) {
      throw new BadRequestException('El candidato no tiene un CV subido para analizar');
    }

    try {
      console.log('Descargando CV para re-análisis desde:', candidato.cvUrl);
      const response = await fetch(candidato.cvUrl);
      if (!response.ok) throw new Error(`Status ${response.status} al descargar el CV`);
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log('Extrayendo texto del PDF descargado...');
      const textoPdf = await extraerTextoPdf(buffer);
      if (!textoPdf) throw new Error('El PDF parece estar vacío o no contiene texto extraíble');

      console.log('Enviando a procesar con IA (Re-análisis)...');
      await this.profileService.procesarCVConIA(id, textoPdf);
      console.log('Re-análisis completado con éxito');
      
      return { message: 'CV re-analizado correctamente y datos estructurados actualizados' };
    } catch (error) {
      console.error('Error al intentar re-analizar el CV:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException('Fallo al re-analizar el CV: ' + message);
    }
  }

  // GET /api/profile/empresa
  @Get('empresa')
  @UseGuards(JwtGuard)
  getCurrentEmpresa(@Req() req: any) {
    return this.profileService.getEmpresaProfile(req.user.sub);
  }

  // PATCH /api/profile/empresa (usa el token)
  @Patch('empresa')
  @UseGuards(JwtGuard)
  updateCurrentEmpresa(
    @Req() req: any,
    @Body() body: {
      nombre?:      string;
      industria?:   string;
      descripcion?: string;
      ubicacion?:   string;
      sitioWeb?:    string;
      anoFundacion?: number;
      tamanoEmpresa?: string;
    },
  ) {
    return this.profileService.updateEmpresaByUserId(req.user.sub, body);
  }

  // POST /api/profile/empresa/logo
  @Post('empresa/logo')
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          return cb(new BadRequestException('Solo se aceptan imágenes JPG, PNG o WebP'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadEmpresaLogo(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se recibió ninguna imagen');

    const logoUrl = await this.storageService.subirFotoPerfil(
      file.buffer,
      file.originalname,
      req.user.sub,
      file.mimetype,
    );

    if (!logoUrl) throw new BadRequestException('No se pudo subir el logo');

    await this.profileService.updateEmpresaLogoByUserId(req.user.sub, logoUrl);

    return { logoUrl, message: 'Logo subido correctamente' };
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
      anoFundacion?: number;
      tamanoEmpresa?: string;
    },
  ) {
    return this.profileService.updateEmpresa(id, body);
  }

  // DELETE /api/profile/candidato/:id/cv — elimina el CV y los datos asociados
  @Post('candidato/:id/cv/delete')
  @UseGuards(JwtGuard)
  async deleteCvPost(@Param('id') id: string) {
    return this.handleDeleteCv(id);
  }

  // Alternativa PATCH para limpiar datos
  @Patch('candidato/:id/cv/clear')
  @UseGuards(JwtGuard)
  async clearCv(@Param('id') id: string) {
    return this.handleDeleteCv(id);
  }

  private async handleDeleteCv(id: string) {
    // 1. Obtener candidato para borrar archivos de storage
    const candidate = await this.profileService.getCandidato(id).catch(() => null);
    if (candidate) {
      console.log(`Eliminando archivos de Storage para candidato: ${candidate.id}`);
      await this.storageService.eliminarCV(candidate.id);
    }

    // 2. Eliminar datos de la DB
    console.log(`Eliminando datos de DB para candidato/usuario: ${id}`);
    return this.profileService.eliminarCV(id);
  }

  // GET /api/profile/industrias  — público, sin autenticación
  @Get('industrias')
  getIndustrias() {
    return this.profileService.getIndustrias();
  }
}
