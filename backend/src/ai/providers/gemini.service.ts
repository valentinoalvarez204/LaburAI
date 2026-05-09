import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
- scoreCV: número del 0 al 100 que refleja qué tan completo y competitivo está el CV
- habilidadesTech: habilidades de la profesión/industria (no software)
- habilidadesBlandas: habilidades interpersonales
- tecnologias: software, herramientas, plataformas
- habilidadesFaltantes: máximo 4 sugerencias de certificaciones o habilidades para mejorar el perfil
- formacion: array de strings con título + institución + año si está disponible; máximo 4 entradas
- habilidades: combinar los 3 arrays anteriores en uno plano (para búsquedas rápidas)
- desde/hasta: formato "Mes Año" en español o "Presente"

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
