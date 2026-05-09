import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAPIService } from '../interfaces/ia-service.interface';
import { AnalisisCVDto } from '../dto/analisis-cv.dto';

@Injectable()
export class GeminiService implements IAPIService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      // Forzamos el uso de la versión v1 estable
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async analizarCV(textoCV: string): Promise<AnalisisCVDto> {
    this.logger.log('Analizando CV con Gemini...');
    
    if (!this.genAI) {
      this.logger.warn('GEMINI_API_KEY no configurada. Devolviendo mock.');
      return {
        skills: ['Configurar API Key'],
        experienciaAnios: 0,
        resumen: 'Por favor, configura GEMINI_API_KEY en el archivo .env'
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = `
        Sos un experto en reclutamiento. Analiza el siguiente texto de un CV y extrae la información en formato JSON puro, sin markdown, sin explicaciones.
        
        Estructura requerida:
        {
          "skills": ["habilidad1", "habilidad2"],
          "experienciaAnios": 5,
          "resumen": "resumen profesional corto"
        }
        
        Texto del CV:
        ${textoCV}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extraer el JSON del texto (a veces Gemini pone markdown ```json)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as AnalisisCVDto;
      }
      
      throw new Error('No se pudo parsear la respuesta de la IA como JSON');
    } catch (error) {
      this.logger.error('Error al analizar CV con Gemini:', error);
      return {
        skills: [],
        experienciaAnios: 0,
        resumen: 'Error en el procesamiento del CV con IA.'
      };
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
