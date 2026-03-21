import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: {
    email: string;
    password: string;
    rol: 'CANDIDATO' | 'EMPRESA';
    nombre: string;
    apellido?: string;
    nombreEmpresa?: string;
  }) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }
}