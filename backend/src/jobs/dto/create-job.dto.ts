import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @IsString()
  @MinLength(3)
  titulo: string;

  @IsString()
  @MinLength(10)
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
}
