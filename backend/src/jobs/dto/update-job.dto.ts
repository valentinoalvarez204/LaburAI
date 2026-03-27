import { IsString, IsOptional, IsInt, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  rubro?: string;

  @IsOptional()
  @IsString()
  modalidad?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsString()
  jornada?: string;

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
