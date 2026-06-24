import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    usuarioId: string;
    titulo: string;
    mensaje: string;
    tipo?: string;
    link?: string;
  }) {
    return this.prisma.notificacion.create({
      data: {
        usuarioId: data.usuarioId,
        titulo: data.titulo,
        mensaje: data.mensaje,
        tipo: data.tipo || 'info',
        link: data.link,
      },
    });
  }

  async findAll(usuarioId: string) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { creadoEn: 'desc' },
      take: 20,
    });
  }

  async getUnreadCount(usuarioId: string) {
    const count = await this.prisma.notificacion.count({
      where: { usuarioId, leida: false },
    });
    return { count };
  }

  async markAsRead(id: string) {
    return this.prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });
  }

  async markAllAsRead(usuarioId: string) {
    return this.prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    });
  }

  async removeAll(usuarioId: string) {
    return this.prisma.notificacion.deleteMany({
      where: { usuarioId },
    });
  }

  async remove(id: string) {
    return this.prisma.notificacion.delete({
      where: { id },
    });
  }
}
