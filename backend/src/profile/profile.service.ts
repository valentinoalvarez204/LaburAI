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
        habilidadesTech: true,
        experiencias: { orderBy: { desde: 'desc' } },
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
    
    // Buscar ID real de candidato (id puede ser de usuario o de candidato en pruebas actuales)
    let candidato = await this.prisma.candidato.findUnique({ where: { id } });
    if (!candidato) {
      candidato = await this.prisma.candidato.findUnique({ where: { usuarioId: id } });
    }
    if (!candidato) throw new NotFoundException('Candidato no encontrado para procesar CV');

    const cId = candidato.id;

    // 1. Actualizar campos planos del candidato
    await this.prisma.candidato.update({
      where: { id: cId },
      data: {
        resumenIA: analisis.resumen,
        scoreCV: analisis.scoreCV,
        habilidades: analisis.habilidades || [],
        habilidadesFaltantes: analisis.habilidadesFaltantes || [],
        formacion: analisis.formacion || [],
      }
    });

    // 2. Limpiar y recrear Habilidades categorizadas
    await this.prisma.habilidadCandidato.deleteMany({ where: { candidatoId: cId } });
    const dataHabs: any[] = [];
    if (Array.isArray(analisis.habilidadesTech)) {
      dataHabs.push(...analisis.habilidadesTech.map(n => ({ nombre: n, tipo: 'TECNICA', candidatoId: cId })));
    }
    if (Array.isArray(analisis.habilidadesBlandas)) {
      dataHabs.push(...analisis.habilidadesBlandas.map(n => ({ nombre: n, tipo: 'BLANDA', candidatoId: cId })));
    }
    if (Array.isArray(analisis.tecnologias)) {
      dataHabs.push(...analisis.tecnologias.map(n => ({ nombre: n, tipo: 'TECNOLOGIA', candidatoId: cId })));
    }
    if (dataHabs.length > 0) {
      await this.prisma.habilidadCandidato.createMany({ data: dataHabs });
    }

    // 3. Limpiar y recrear Experiencias
    await this.prisma.experienciaCandidato.deleteMany({ where: { candidatoId: cId } });
    if (Array.isArray(analisis.experiencias) && analisis.experiencias.length > 0) {
      const exps = analisis.experiencias.map(e => ({
        rol: e.rol || 'Rol desconocido',
        empresa: e.empresa || 'Empresa',
        desde: e.desde || '',
        hasta: e.hasta || '',
        descripcion: e.descripcion || '',
        candidatoId: cId
      }));
      await this.prisma.experienciaCandidato.createMany({ data: exps });
    }

    return this.prisma.candidato.findUnique({ where: { id: cId } });
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