import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum Rol {
  CANDIDATO = 'CANDIDATO',
  EMPRESA = 'EMPRESA',
}

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEnum(Rol, { message: 'El rol debe ser CANDIDATO o EMPRESA' })
  rol: Rol;

  @IsString()
  @MinLength(1)
  nombre: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  nombreEmpresa?: string;
}
