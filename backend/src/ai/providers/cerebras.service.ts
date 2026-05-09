import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { IAPIService } from '../interfaces/ia-service.interface';
import { AnalisisCVDto } from '../dto/analisis-cv.dto';

const PROMPT_ANALISIS_CV = (textoCV: string) => `
Sos un experto en reclutamiento de Argentina. Analizá el siguiente CV y respondé ÚNICAMENTE con un JSON válido sin markdown, sin explicaciones, sin texto extra.

Estructura requerida (todos los campos son obligatorios, usá arrays vacíos si no hay datos):
{
  "resumen": "resumen profesional de 2-3 oraciones en español",
  "scoreCV": 72,
  "habilidades": ["habilidad1", "habilidad2"],
  "habilidadesTech": ["Ventas B2B", "Negociación", "Gestión de cuentas"],
  "habilidadesBlandas": ["Liderazgo", "Comunicación", "Trabajo en equipo"],
  "tecnologias": ["Excel", "SAP", "Salesforce"],
  "habilidadesFaltantes": ["Power BI", "SQL básico"],
  "formacion": ["Lic. Recursos Humanos — UBA (2018)", "Posgrado en Gestión — UTDT (2021)"],
  "experiencias": [
    {
      "rol": "Gerente de Ventas",
      "empresa": "Empresa X",
      "desde": "Mar 2020",
      "hasta": "Presente",
      "descripcion": "breve descripción del rol"
    }
  ]
}

Reglas:
- scoreCV: número del 0 al 100
- habilidadesTech: habilidades de la profesión/industria (no software)
- habilidadesBlandas: habilidades interpersonales
- tecnologias: software, herramientas, plataformas
- habilidadesFaltantes: máximo 4 sugerencias de certificaciones o habilidades para mejorar el perfil
- formacion: array de strings con título + institución + año si está disponible; máximo 4 entradas
- habilidades: combinar los 3 arrays anteriores en uno plano
- desde/hasta: formato "Mes Año" en español o "Presente"

CV a analizar:
${textoCV}
`.trim();

@Injectable()
export class CerebrasService implements IAPIService {
  private readonly logger = new Logger(CerebrasService.name);
  private client: Cerebras;

  private readonly FALLBACK: AnalisisCVDto = {
    resumen: 'Error en Cerebras',
    scoreCV: 0,
    habilidades: [],
    habilidadesTech: [],
    habilidadesBlandas: [],
    tecnologias: [],
    habilidadesFaltantes: [],
    formacion: [],
    experiencias: [],
  };

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('CEREBRAS_API_KEY');
    if (apiKey) {
      this.client = new Cerebras({ apiKey });
    }
  }

  async analizarCV(textoCV: string): Promise<AnalisisCVDto> {
    this.logger.log('Analizando CV con Cerebras (Llama 3.1 8B)...');

    if (!this.client) {
      this.logger.warn('CEREBRAS_API_KEY no configurada.');
      return { ...this.FALLBACK, resumen: 'Configurá CEREBRAS_API_KEY' };
    }

    try {
      const response: any = await this.client.chat.completions.create({
        model: 'llama3.1-8b',
        messages: [{ role: 'user', content: PROMPT_ANALISIS_CV(textoCV) }],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Cerebras no devolvió contenido');

      return JSON.parse(content) as AnalisisCVDto;
    } catch (error) {
      this.logger.error('Error en Cerebras:', error);
      return this.FALLBACK;
    }
  }

  async calcularMatch(perfilCV: string, ofertaTrabajo: string): Promise<number> {
    this.logger.log('Calculando Match con Cerebras (Low Token Mode)...');
    if (!this.client) return 0;

    try {
      const response: any = await this.client.chat.completions.create({
        model: 'llama3.1-8b',
        messages: [{
          role: 'user',
          content: `Compara este candidato con la oferta y devuelve la compatibilidad del 0 al 100.
Formato: JSON puro con la clave "match" y el número.

Candidato:
${perfilCV}

Oferta:
${ofertaTrabajo}`,
        }],
        response_format: { type: 'json_object' },
        max_tokens: 20,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return 0;

      const parsed = JSON.parse(content);
      return parsed.match || 0;
    } catch (error) {
      this.logger.error('Error calculando match en Cerebras:', error);
      return 0;
    }
  }
}
