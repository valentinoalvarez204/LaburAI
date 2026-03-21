import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    rol: 'CANDIDATO' | 'EMPRESA';
    nombre: string;
    apellido?: string;
    nombreEmpresa?: string;
  }) {
    // Verificar si el email ya existe
    const existe = await this.prisma.usuario.findUnique({
      where: { email: data.email },
    });
    if (existe) throw new BadRequestException('El email ya está registrado');

    // Encriptar contraseña
    const hash = await bcrypt.hash(data.password, 10);

    // Crear usuario
    const usuario = await this.prisma.usuario.create({
      data: {
        email: data.email,
        password: hash,
        rol: data.rol,
      },
    });

    // Crear perfil según rol
    if (data.rol === 'CANDIDATO') {
      await this.prisma.candidato.create({
        data: {
          nombre: data.nombre,
          apellido: data.apellido || '',
          usuarioId: usuario.id,
        },
      });
    } else {
      await this.prisma.empresa.create({
        data: {
          nombre: data.nombreEmpresa || data.nombre,
          usuarioId: usuario.id,
        },
      });
    }

    // Generar token
    const token = this.jwt.sign({ sub: usuario.id, rol: usuario.rol });

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: data.rol === 'CANDIDATO' ? data.nombre : data.nombreEmpresa,
      },
    };
  }

  async login(data: { email: string; password: string }) {
    // Buscar usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: data.email },
      include: {
        candidato: true,
        empresa: true,
      },
    });
    if (!usuario) throw new UnauthorizedException('Email o contraseña incorrectos');

    // Verificar contraseña
    const valida = await bcrypt.compare(data.password, usuario.password);
    if (!valida) throw new UnauthorizedException('Email o contraseña incorrectos');

    // Generar token
    const token = this.jwt.sign({ sub: usuario.id, rol: usuario.rol });

    const nombre = usuario.rol === 'CANDIDATO'
      ? `${usuario.candidato?.nombre} ${usuario.candidato?.apellido}`
      : usuario.empresa?.nombre;

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre,
      },
    };
  }
}