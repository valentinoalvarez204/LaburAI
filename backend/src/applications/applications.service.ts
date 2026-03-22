import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  // Postularse a una oferta
  async create(data: {
    candidatoId: string;
    ofertaId: string;
    cartaMotivacion?: string;
  }) {
    // Verificar que la oferta existe
    const oferta = await this.prisma.ofertaLaboral.findUnique({
      where: { id: data.ofertaId },
    });
    if (!oferta) throw new NotFoundException('Oferta no encontrada');
    if (!oferta.activa) throw new BadRequestException('Esta oferta ya no está activa');

    // Verificar que no se haya postulado antes
    const yaPostulado = await this.prisma.postulacion.findUnique({
      where: {
        candidatoId_ofertaId: {
          candidatoId: data.candidatoId,
          ofertaId: data.ofertaId,
        },
      },
    });
    if (yaPostulado) throw new BadRequestException('Ya te postulaste a esta oferta');

    return this.prisma.postulacion.create({
      data: {
        candidatoId: data.candidatoId,
        ofertaId:    data.ofertaId,
        cartaMotivacion: data.cartaMotivacion,
      },
      include: {
        oferta: {
          select: { titulo: true, empresa: { select: { nombre: true } } },
        },
      },
    });
  }

  // Ver postulaciones de un candidato
  async findByCandidato(candidatoId: string) {
    return this.prisma.postulacion.findMany({
      where: { candidatoId },
      include: {
        oferta: {
          include: {
            empresa: { select: { nombre: true, ubicacion: true } },
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  // Ver postulaciones de una oferta (para empresas)
  async findByOferta(ofertaId: string) {
    return this.prisma.postulacion.findMany({
      where: { ofertaId },
      include: {
        candidato: {
          select: {
            nombre: true,
            apellido: true,
            ubicacion: true,
            habilidades: true,
            scoreCV: true,
            cvUrl: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  // Cambiar estado de una postulación (para empresas)
  async updateEstado(id: string, estado: 'PENDIENTE' | 'REVISADA' | 'ENTREVISTA' | 'RECHAZADA') {
    return this.prisma.postulacion.update({
      where: { id },
      data: { estado },
    });
  }
}