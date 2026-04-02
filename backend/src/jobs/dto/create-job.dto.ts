import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  rubro: string;

  @IsString()
  modalidad: string;

  @IsString()
  ubicacion: string;

  @IsString()
  jornada: string;

  @IsOptional()
  @IsString()
  experiencia?: string;

  @IsOptional()
  @IsString()
  estudios?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salarioMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salarioMax?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  habilidades?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vacantes?: number;

  @IsOptional()
  @IsString()
  fechaLimite?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsabilidades?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  beneficios?: string[];

  @IsOptional()
  @IsBoolean()
  esBorrador?: boolean;
}
