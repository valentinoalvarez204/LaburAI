export class ExperienciaDto {
  rol: string;
  empresa: string;
  ubicacion: string;
  desde: string;
  hasta: string;
  descripcion: string;
  tecnologiasDetectadas: string[];
}

export class FormacionDto {
  titulo: string;
  institucion: string;
  anio: string;
}

export class ScoreCVDto {
  completitud: number;
  claridad: number;
  estructura: number;
}

export class AnalisisCVDto {
  resumen: string;
  scoreCV: ScoreCVDto;
  habilidadesTecnicas: string[];
  habilidadesBlandas: string[];
  tecnologias: string[];
  idiomas: string[];
  certificaciones: string[];
  formacion: FormacionDto[];
  experiencias: ExperienciaDto[];
}
