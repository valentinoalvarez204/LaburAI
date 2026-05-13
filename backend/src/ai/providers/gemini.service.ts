import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAPIService } from '../interfaces/ia-service.interface';
import { AnalisisCVDto } from '../dto/analisis-cv.dto';

const PROMPT_ANALISIS_CV = (textoCV: string) => `
Sos un recruiter IT nivel Senior de Argentina con vista de águila. Tu función es extraer la información del siguiente CV con un nivel de precisión y detalle EXTRAORDINARIO. No podés obviar NINGUNA experiencia laboral, puesto, habilidad o tecnología.

Tu salida debe ser ÚNICAMENTE un JSON válido, sin markdown, sin explicaciones ni texto extra. Formato estricto:

{
  "resumen": "Resumen profesional redactado en tercera persona, muy completo (3-4 oraciones), destacando seniority, rubro y stack principal.",
  "scoreCV": 85,
  "habilidades": ["habilidad1", "habilidad2"],
  "habilidadesTech": ["Ventas B2B", "Negociación", "Arquitectura", "Testing"],
  "habilidadesBlandas": ["Liderazgo", "Comunicación efectiva", "Resolución de problemas"],
  "tecnologias": ["Excel", "React", "Node.js", "AWS", "Python"],
  "habilidadesFaltantes": ["Inglés Avanzado", "Docker"],
  "formacion": ["Lic. Recursos Humanos — UBA (2018)", "Curso de UX — Coderhouse (2022)"],
  "experiencias": [
    {
      "rol": "Nombre exacto del cargo / puesto",
      "empresa": "Nombre de la empresa o cliente",
      "desde": "Mes Año",
      "hasta": "Mes Año o Presente",
      "descripcion": "Descripción EXHAUSTIVA de las responsabilidades, logros y tareas. Extraé absolutamente TODO el contexto del rol que figure en el CV, incluyendo las tecnologías usadas allí."
    }
  ]
}

Reglas CRÍTICAS de extracción:
1. EXTRACCIÓN DE EXPERIENCIA: Es tu máxima prioridad. Revisá todo el documento de arriba a abajo. Extraé ABSOLUTAMENTE TODAS las experiencias laborales detalladas. No recortes sus descripciones; si el CV incluye viñetas de tareas o logros, unilas en un párrafo completo detallado en 'descripcion'.
2. habilidades, habilidadesTech, tecnologias: Escaneá a fondo buscando menciones implícitas y explícitas de software u oficios. (Ej: si dice que implementó una API en Python en una de las experiencias, 'Python' debe ir a 'tecnologias').
3. habilidades: Combinar tech, blandas y tecnologías en un sólo array unificado para que el sistema indexe todo.
4. desde/hasta: Mantené el formato "Mes Año" en español. Si sigue activo, "Presente".
5. Si no hay datos para un array, devolvé [].

CV a analizar:
${textoCV}
`.trim();

@Injectable()
export class GeminiService implements IAPIService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;

  private readonly FALLBACK: AnalisisCVDto = {
    resumen: 'Error en el procesamiento del CV con IA.',
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
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async analizarCV(textoCV: string): Promise<AnalisisCVDto> {
    this.logger.log('Analizando CV con Gemini...');

    if (!this.genAI) {
      this.logger.warn('GEMINI_API_KEY no configurada.');
      return { ...this.FALLBACK, resumen: 'Por favor, configurá GEMINI_API_KEY en el .env' };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(PROMPT_ANALISIS_CV(textoCV));
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as AnalisisCVDto;
      }
      throw new Error('No se pudo parsear la respuesta de la IA como JSON');
    } catch (error) {
      this.logger.error('Error al analizar CV con Gemini:', error);
      return this.FALLBACK;
    }
  }

  async calcularMatch(perfilCV: string, ofertaTrabajo: string): Promise<number> {
    this.logger.log('Calculando Match con Gemini... (Low Token Mode)');

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `Compara este candidato con la oferta y devuelve la compatibilidad del 0 al 100.
Formato: JSON puro con la única clave "match" y el número entero. Sin markdown.

Candidato:
${perfilCV}

Oferta:
${ofertaTrabajo}`;

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(text);
      return parsed.match || 0;
    } catch (error) {
      this.logger.error('Error calculando match en Gemini:', error);
      return 0;
    }
  }
}
