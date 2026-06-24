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
  }) {
    return this.prisma.candidato.update({
      where: { id: candidatoId },
      data,
    });
  }

  async updateCandidatoFoto(candidatoId: string, fotoUrl: string) {
    return this.prisma.candidato.update({
      where: { id: candidatoId },
      data: { fotoUrl },
      select: { id: true, fotoUrl: true },
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
    
    // Buscar ID real de candidato
    let candidato = await this.prisma.candidato.findUnique({ where: { id } });
    if (!candidato) {
      candidato = await this.prisma.candidato.findUnique({ where: { usuarioId: id } });
    }
    if (!candidato) throw new NotFoundException('Candidato no encontrado para procesar CV');

    const cId = candidato.id;

    // 1. Calcular un score general basado en el nuevo objeto scoreCV (con checks defensivos)
    const score = analisis.scoreCV || { completitud: 0, claridad: 0, estructura: 0 };
    const avgScore = Math.round(
      ((score.completitud || 0) + 
       (score.claridad || 0) + 
       (score.estructura || 0)) / 3
    );

    // 2. Mapear formación a strings para el esquema actual
    const formacion = Array.isArray(analisis.formacion) ? analisis.formacion : [];
    const formacionStrings = formacion.map(f => {
      const titulo = f?.titulo || '';
      const inst = f?.institucion || '';
      const anio = f?.anio || '';
      return `${titulo} — ${inst} (${anio})`.replace(/ —  \(\)/, '').trim();
    }).filter(s => s !== '');

    // 3. Combinar todas las habilidades para el array plano de indexación
    const habilidadesPlanas = [
      ...(Array.isArray(analisis.habilidadesTecnicas) ? analisis.habilidadesTecnicas : []),
      ...(Array.isArray(analisis.habilidadesBlandas) ? analisis.habilidadesBlandas : []),
      ...(Array.isArray(analisis.tecnologias) ? analisis.tecnologias : [])
    ];

    // 4. Actualizar campos planos del candidato
    await this.prisma.candidato.update({
      where: { id: cId },
      data: {
        resumenIA: analisis.resumen || 'Sin resumen disponible.',
        scoreCV: avgScore,
        habilidades: habilidadesPlanas,
        habilidadesFaltantes: [],
        formacion: formacionStrings,
      }
    });

    // 5. Limpiar y recrear Habilidades categorizadas
    await this.prisma.habilidadCandidato.deleteMany({ where: { candidatoId: cId } });
    const dataHabs: any[] = [];
    if (Array.isArray(analisis.habilidadesTecnicas)) {
      dataHabs.push(...analisis.habilidadesTecnicas.map(n => ({ nombre: n, tipo: 'TECNICA', candidatoId: cId })));
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

  async updateEmpresaLogoByUserId(usuarioId: string, logoUrl: string) {
    return this.prisma.empresa.update({
      where: { usuarioId },
      data: { logoUrl },
      select: { id: true, logoUrl: true },
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

  // Eliminar el CV y todos los datos asociados
  async eliminarCV(id: string) {
    // Buscar ID real de candidato
    let candidato = await this.prisma.candidato.findUnique({ where: { id } });
    if (!candidato) {
      candidato = await this.prisma.candidato.findUnique({ where: { usuarioId: id } });
    }
    if (!candidato) throw new NotFoundException('Candidato no encontrado');

    const cId = candidato.id;

    // 1. Limpiar campos del candidato
    await this.prisma.candidato.update({
      where: { id: cId },
      data: {
        cvUrl: null,
        resumenIA: null,
        scoreCV: null,
        habilidades: [],
        habilidadesFaltantes: [],
        formacion: [],
      }
    });

    // 2. Eliminar habilidades y experiencias categorizadas
    await this.prisma.habilidadCandidato.deleteMany({ where: { candidatoId: cId } });
    await this.prisma.experienciaCandidato.deleteMany({ where: { candidatoId: cId } });

    return { message: 'CV y datos asociados eliminados correctamente', candidatoId: cId };
  }
}
