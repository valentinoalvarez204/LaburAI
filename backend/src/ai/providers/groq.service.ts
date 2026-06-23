import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { IAPIService } from '../interfaces/ia-service.interface';
import { AnalisisCVDto } from '../dto/analisis-cv.dto';

// El CV se pasa siempre en el role: user, nunca dentro del system prompt.
const PROMPT_ANALISIS_CV = () => `
Sos un parser ATS especializado en extracción de CVs.
Tu tarea es extraer ÚNICAMENTE información explícita del CV que recibirás.

REGLAS ESTRICTAS:
- NO inventes información que no esté escrita.
- NO deduzcas tecnologías ni completes stacks.
- NO agregues experiencia no mencionada.
- Si el CV no es IT, NO incluyas tecnologías IT.
- Si un dato no existe, usá [] para arrays y "" para strings.
- Respondé SOLO JSON válido, sin markdown, sin texto adicional.

CRITERIOS PARA scoreCV (escala 0-100 cada uno):
- "completitud": ¿qué tan completo está el CV? (tiene contacto, resumen, experiencia, formación, habilidades)
- "claridad": ¿qué tan fácil es leer y entender el contenido?
- "estructura": ¿está bien organizado y ordenado cronológicamente?

Formato de respuesta:

{
  "resumen": "Breve descripción fiel al CV, máximo 3 oraciones.",
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

INSTRUCCIONES ADICIONALES:
- Extraer TODAS las experiencias laborales sin omitir ninguna.
- Mantener nombres exactos de empresas, roles y tecnologías.
- Unir viñetas/bullets de una misma experiencia en un solo texto en "descripcion".
- Separar habilidades técnicas (herramientas, metodologías) de blandas (comunicación, liderazgo).
- Incluir tecnologías en "tecnologiasDetectadas" SOLO si aparecen explícitamente en esa experiencia.
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
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: PROMPT_ANALISIS_CV(), // Sin parámetro — el CV va en el user message
          },
          {
            role: 'user',
            content: textoCV,
          },
        ],
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

    // Truncar inputs para respetar el rate limit de 6000 tokens/min del plan free.
    // El CV ya viene procesado (resumen del DTO), así que 600 chars es suficiente.
    const cvTruncado = perfilCV.slice(0, 600);
    const ofertaTruncada = ofertaTrabajo.slice(0, 400);

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            // Sistema separado del user: el modelo lo procesa mejor y gasta menos tokens
            content: 'Respondé SOLO con JSON válido. Sin markdown. Sin texto adicional. Formato: {"match": 0}',
          },
          {
            role: 'user',
            content: `Compatibilidad candidato/oferta del 0 al 100. Devolvé solo {"match": N}.

Candidato:
${cvTruncado}

Oferta:
${ofertaTruncada}`,
          },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
        max_tokens: 20, // {"match": 85} son ~8 tokens, 20 es suficiente y seguro
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return 0;

      const parsed = this.cleanAndParseJSON(content);
      return parsed?.match ?? 0;
    } catch (error) {
      this.logger.error('Error calculando match en Groq:', error);
      return 0;
    }
  }
}
