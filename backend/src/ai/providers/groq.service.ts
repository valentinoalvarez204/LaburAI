import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
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
export class GroqService implements IAPIService {
  private readonly logger = new Logger(GroqService.name);
  private groq: Groq;

  private readonly FALLBACK: AnalisisCVDto = {
    resumen: 'Error en el procesamiento del CV con Groq.',
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
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (apiKey) {
      this.groq = new Groq({ apiKey });
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
    this.logger.log('Analizando CV con Groq (Llama 3.3)...');

    if (!this.groq) {
      this.logger.warn('GROQ_API_KEY no configurada.');
      return { ...this.FALLBACK, resumen: 'Configurá GROQ_API_KEY' };
    }

    try {
      const completion = await this.groq.chat.completions.create({
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
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Groq no devolvió contenido');

      const parsed = this.cleanAndParseJSON(content);
      if (parsed) {
        return parsed as AnalisisCVDto;
      }

      throw new Error('No se pudo obtener un JSON válido');
    } catch (error) {
      this.logger.error('Error en Groq:', error);
      return this.FALLBACK;
    }
  }

  async calcularMatch(perfilCV: string, ofertaTrabajo: string): Promise<number> {
    this.logger.log('Calculando Match con Groq (Low Token Mode)...');
    if (!this.groq) return 0;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'user',
          content: `Sos un asistente objetivo de matching profesional.
Compará estrictamente el perfil del candidato con los requisitos de la oferta.
No agregues información que no esté en los textos.
Respondé solo JSON válido.

Formato esperado:
{
  "match": 0,
  "fortalezas": [],
  "brechas": []
}

Instrucciones:
- "match" debe ser un entero entre 0 y 100.
- "fortalezas" lista hasta 3 puntos fuertes del candidato para esta oferta.
- "brechas" lista hasta 3 áreas donde el candidato no cumple completamente.
- No incluyas explicaciones adicionales ni markdown.

Candidato:
${perfilCV}

Oferta:
${ofertaTrabajo}`,
        }],
        temperature: 0,
        response_format: { type: 'json_object' },
        max_tokens: 60,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return 0;

      const parsed = this.cleanAndParseJSON(content);
      return parsed?.match || 0;
    } catch (error) {
      this.logger.error('Error calculando match en Groq:', error);
      return 0;
    }
  }
}
