import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { IAPIService } from '../interfaces/ia-service.interface';
import { AnalisisCVDto } from '../dto/analisis-cv.dto';

const PROMPT_ANALISIS_CV = (textoCV: string) => `
Sos un parser ATS especializado en extracción de CVs.

Tu tarea es extraer únicamente información explícita del CV.

REGLAS:
- NO inventes información.
- NO deduzcas tecnologías.
- NO agregues experiencia no escrita.
- NO completes stacks.
- Si el CV no es IT, NO agregues tecnologías IT.
- Si un dato no existe, devolver [] o "".
- Responder SOLO JSON válido.
- Sin markdown.
- Sin explicación.

Formato:

{
  "resumen": "",
  "scoreCV": {
    "completitud": 0,
    "claridad": 0,
    "estructura": 0
  },
  "habilidadesTecnicas": [],
  "habilidadesBlandas": [],
  "tecnologias": [],
  "idiomas": [],
  "certificaciones": [],
  "formacion": [
    {
      "titulo": "",
      "institucion": "",
      "anio": ""
    }
  ],
  "experiencias": [
    {
      "rol": "",
      "empresa": "",
      "ubicacion": "",
      "desde": "",
      "hasta": "",
      "descripcion": "",
      "tecnologiasDetectadas": []
    }
  ]
}

INSTRUCCIONES:
- Extraer TODAS las experiencias laborales.
- Mantener nombres exactos.
- Unir viñetas en un solo texto.
- No resumir demasiado.
- Tecnologías SOLO si aparecen explícitamente.
- Separar habilidades técnicas y blandas.
- El resumen debe ser breve y fiel al CV.

CV:
${textoCV}
`.trim();

@Injectable()
export class CerebrasService implements IAPIService {
  private readonly logger = new Logger(CerebrasService.name);
  private client: Cerebras;

  private readonly FALLBACK: AnalisisCVDto = {
    resumen: 'Error en el procesamiento del CV con Cerebras.',
    scoreCV: { completitud: 0, claridad: 0, estructura: 0 },
    habilidadesTecnicas: [],
    habilidadesBlandas: [],
    tecnologias: [],
    idiomas: [],
    certificaciones: [],
    formacion: [],
    experiencias: [],
  };

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('CEREBRAS_API_KEY');
    if (apiKey) {
      this.client = new Cerebras({ apiKey });
    }
  }

  private cleanAndParseJSON(text: string): any {
    try {
      const cleaned = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(cleaned);
    } catch (e) {
      this.logger.error('Error parseando JSON:', e);
      return null;
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
        messages: [
          {
            role: 'system',
            content: PROMPT_ANALISIS_CV('')
          },
          {
            role: 'user',
            content: textoCV
          }
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Cerebras no devolvió contenido');

      const parsed = this.cleanAndParseJSON(content);
      if (parsed) {
        return parsed as AnalisisCVDto;
      }

      throw new Error('No se pudo obtener un JSON válido');
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
        temperature: 0,
        response_format: { type: 'json_object' },
        max_tokens: 20,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return 0;

      const parsed = this.cleanAndParseJSON(content);
      return parsed?.match || 0;
    } catch (error) {
      this.logger.error('Error calculando match en Cerebras:', error);
      return 0;
    }
  }
}
