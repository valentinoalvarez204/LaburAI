import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) { }

  // Postularse a una oferta
  async create(usuarioId: string, data: {
    ofertaId: string;
    cartaMotivacion?: string;
  }) {
    // Buscar el perfil de candidato asociado a este usuario
    const candidato = await this.prisma.candidato.findUnique({
      where: { usuarioId }
    });
    if (!candidato) throw new NotFoundException('Perfil de candidato no encontrado');

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
          candidatoId: candidato.id,
          ofertaId: data.ofertaId,
        },
      },
    });
    if (yaPostulado) throw new BadRequestException('Ya te postulaste a esta oferta');

    return this.prisma.postulacion.create({
      data: {
        candidatoId: candidato.id,
        ofertaId: data.ofertaId,
        cartaMotivacion: data.cartaMotivacion,
        estado: 'PENDIENTE', // siempre forzado al crear
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

  // Actualizar una postulación (estado o notes)
  async update(id: string, data: { estado?: 'PENDIENTE' | 'REVISADA' | 'ENTREVISTA' | 'RECHAZADA', notes?: string }) {
    return this.prisma.postulacion.update({
      where: { id },
      data,
    });
  }

  // Ver una postulación específica
  async findOne(id: string) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id },
      include: {
        candidato: {
          include: {
            usuario: { select: { email: true } }
          }
        },
        oferta: {
          include: {
            empresa: { select: { nombre: true, id: true } }
          }
        }
      }
    });
    if (!postulacion) throw new NotFoundException('Postulación no encontrada');
    return postulacion;
  }
}