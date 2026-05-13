import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
      // Remover markdown y limpiar texto
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
      // Usar systemInstruction para el prompt y user para el CV
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        systemInstruction: PROMPT_ANALISIS_CV(''),
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json',
        }
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

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json',
        }
      });

      const prompt = `Compara este candidato con la oferta y devuelve la compatibilidad del 0 al 100.
Formato: JSON puro con la única clave "match" y el número entero. Sin markdown.

Candidato:
${perfilCV}

Oferta:
${ofertaTrabajo}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = this.cleanAndParseJSON(text);
      
      return parsed?.match || 0;
    } catch (error) {
      this.logger.error('Error calculando match en Gemini:', error);
      return 0;
    }
  }
}
