import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /api/profile/candidato/:id
  @Get('candidato/:id')
  getCandidato(@Param('id') id: string) {
    return this.profileService.getCandidato(id);
  }

  // PATCH /api/profile/candidato/:id
  @Patch('candidato/:id')
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

  // GET /api/profile/empresa/:id
  @Get('empresa/:id')
  getEmpresa(@Param('id') id: string) {
    return this.profileService.getEmpresa(id);
  }

  // PATCH /api/profile/empresa/:id
  @Patch('empresa/:id')
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