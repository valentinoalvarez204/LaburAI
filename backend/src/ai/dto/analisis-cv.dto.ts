export class ExperienciaDto {
  rol: string;
  empresa: string;
  desde: string;
  hasta: string;
  descripcion?: string;
}

export class AnalisisCVDto {
  resumen: string;
  scoreCV: number;              // puntuación general del CV (0-100)
  habilidades: string[];        // array plano — usado por el match IA low-token
  habilidadesTech: string[];    // ej: "Ventas B2B", "Negociación", "Gestión de equipos"
  habilidadesBlandas: string[]; // ej: "Liderazgo", "Comunicación", "Trabajo en equipo"
  tecnologias: string[];        // ej: "Excel", "SAP", "Salesforce", "Python"
  habilidadesFaltantes: string[]; // sugerencias: "Power BI", "SQL básico"
  formacion: string[];          // ej: "Lic. Recursos Humanos — UBA (2018)"
  experiencias: ExperienciaDto[];
}
