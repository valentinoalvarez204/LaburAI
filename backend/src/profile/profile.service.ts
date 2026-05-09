import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AI_PROVIDER_TOKEN } from '../ai/ai.module';
import type { IAPIService } from '../ai/interfaces/ia-service.interface';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    @Inject(AI_PROVIDER_TOKEN) private aiService: IAPIService
  ) {}

  // Obtener perfil del candidato
  async getCandidato(candidatoId: string) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { id: candidatoId },
      include: {
        usuario: { select: { email: true, rol: true } },
        postulaciones: {
          include: {
            oferta: {
              include: {
                empresa: { select: { nombre: true } },
              },
            },
          },
          orderBy: { creadoEn: 'desc' },
        },
      },
    });
    if (!candidato) throw new NotFoundException('Candidato no encontrado');
    return candidato;
  }

  // Actualizar perfil del candidato
  async updateCandidato(candidatoId: string, data: {
    nombre?:    string;
    apellido?:  string;
    ubicacion?: string;
    telefono?:  string;
    linkedin?:  string;
  }) {
    return this.prisma.candidato.update({
      where: { id: candidatoId },
      data,
    });
  }

  // Actualizar la URL del CV
  async updateCvUrl(id: string, cvUrl: string) {
    try {
      // Intentamos actualizar por Candidato ID
      return await this.prisma.candidato.update({
        where: { id },
        data: { cvUrl },
        select: { id: true, cvUrl: true },
      });
    } catch (error) {
      // Si no existe, intentamos por Usuario ID (caso común en pruebas)
      return this.prisma.candidato.update({
        where: { usuarioId: id },
        data: { cvUrl },
        select: { id: true, cvUrl: true },
      });
    }
  }

  // Procesar el texto del CV con Inteligencia Artificial
  async procesarCVConIA(id: string, textoCV: string) {
    const analisis = await this.aiService.analizarCV(textoCV);
    
    const data = {
      resumenIA: analisis.resumen,
      habilidades: analisis.skills,
      scoreCV: analisis.experienciaAnios
    };

    try {
      return await this.prisma.candidato.update({
        where: { id },
        data
      });
    } catch (error) {
      return this.prisma.candidato.update({
        where: { usuarioId: id },
        data
      });
    }
  }

  // Obtener perfil de la empresa
  async getEmpresa(empresaId: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
      include: {
        usuario: { select: { email: true } },
        ofertas: {
          include: {
            postulaciones: { select: { id: true } },
          },
          orderBy: { creadoEn: 'desc' },
        },
      },
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return empresa;
  }

  // Obtener perfil de empresa autenticada
  async getEmpresaProfile(usuarioId: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { usuarioId },
      include: {
        usuario: { select: { email: true } },
      },
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return empresa;
  }

  // Actualizar perfil de la empresa por ID explícito
  async updateEmpresa(empresaId: string, data: {
    nombre?:      string;
    industria?:   string;
    descripcion?: string;
    ubicacion?:   string;
    sitioWeb?:    string;
    anoFundacion?: number;
    tamanoEmpresa?: string;
  }) {
    return this.prisma.empresa.update({
      where: { id: empresaId },
      data,
    });
  }

  // Actualizar perfil de la empresa por Usuario Autenticado
  async updateEmpresaByUserId(usuarioId: string, data: {
    nombre?:      string;
    industria?:   string;
    descripcion?: string;
    ubicacion?:   string;
    sitioWeb?:    string;
    anoFundacion?: number;
    tamanoEmpresa?: string;
  }) {
    return this.prisma.empresa.update({
      where: { usuarioId },
      data,
    });
  }

  // Obtener todas las industrias distintas de la tabla Empresa
  async getIndustrias(): Promise<string[]> {
    const rows = await this.prisma.empresa.findMany({
      where: {
        industria: { not: null },
      },
      select: { industria: true },
      distinct: ['industria'],
      orderBy: { industria: 'asc' },
    });
    return rows
      .map((r) => r.industria as string)
      .filter((v) => v && v.trim() !== '');
  }
}