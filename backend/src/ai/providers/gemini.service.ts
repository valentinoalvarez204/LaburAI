import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
export class GeminiService implements IAPIService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;

  private readonly FALLBACK: AnalisisCVDto = {
    resumen: 'Error en el procesamiento del CV con IA.',
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
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
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
    this.logger.log('Analizando CV con Gemini...');

    if (!this.genAI) {
      this.logger.warn('GEMINI_API_KEY no configurada.');
      return { ...this.FALLBACK, resumen: 'Por favor, configurá GEMINI_API_KEY en el .env' };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: PROMPT_ANALISIS_CV(), // Sin parámetro — el CV va como contenido del usuario
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(textoCV);
      const text = result.response.text();

      const parsed = this.cleanAndParseJSON(text);
      if (parsed) {
        return parsed as AnalisisCVDto;
      }

      throw new Error('No se pudo obtener un JSON válido');
    } catch (error) {
      this.logger.error('Error al analizar CV con Gemini:', error);
      return this.FALLBACK;
    }
  }

  async calcularMatch(perfilCV: string, ofertaTrabajo: string): Promise<number> {
    this.logger.log('Calculando Match con Gemini... (Low Token Mode)');

    // Guard: si no hay cliente configurado, retornar 0 en vez de crashear
    if (!this.genAI) {
      this.logger.warn('GEMINI_API_KEY no configurada.');
      return 0;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: 'Respondé SOLO con JSON válido. Sin markdown. Sin texto adicional. Formato: {"match": 0}',
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json',
        },
      });

      const prompt = `Compatibilidad candidato/oferta del 0 al 100. Devolvé solo {"match": N}.

Candidato:
${perfilCV}

Oferta:
${ofertaTrabajo}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = this.cleanAndParseJSON(text);

      return parsed?.match ?? 0;
    } catch (error) {
      this.logger.error('Error calculando match en Gemini:', error);
      return 0;
    }
  }
}
