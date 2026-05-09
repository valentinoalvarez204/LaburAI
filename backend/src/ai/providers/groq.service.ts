import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { IAPIService } from '../interfaces/ia-service.interface';
import { AnalisisCVDto } from '../dto/analisis-cv.dto';

@Injectable()
export class GroqService implements IAPIService {
  private readonly logger = new Logger(GroqService.name);
  private groq: Groq;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (apiKey) {
      this.groq = new Groq({ apiKey });
    }
  }

  async analizarCV(textoCV: string): Promise<AnalisisCVDto> {
    this.logger.log('Analizando CV con Groq (Llama 3.3)...');

    if (!this.groq) {
      this.logger.warn('GROQ_API_KEY no configurada.');
      return { skills: [], experienciaAnios: 0, resumen: 'Configura GROQ_API_KEY' };
    }

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `Analiza el siguiente CV y devuelve un JSON con: skills (array de strings), experienciaAnios (numero), resumen (string largo).
            
            CV:
            ${textoCV}`,
          },
        ],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Groq no devolvió contenido');
      
      return JSON.parse(content) as AnalisisCVDto;
    } catch (error) {
      this.logger.error('Error en Groq:', error);
      return { skills: [], experienciaAnios: 0, resumen: 'Error en Groq' };
    }
  }

  async calcularMatch(perfilCV: string, ofertaTrabajo: string): Promise<number> {
    this.logger.log('Calculando Match con Groq (Low Token Mode)...');
    if (!this.groq) return 0;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'user',
            content: `Compara este candidato con la oferta y devuelve la compatibilidad del 0 al 100.
Formato: JSON puro con la clave "match" y el número.

Candidato:
${perfilCV}

Oferta:
${ofertaTrabajo}`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 20, // Ahorro masivo de tokens
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return 0;

      const parsed = JSON.parse(content);
      return parsed.match || 0;
    } catch (error) {
      this.logger.error('Error calculando match en Groq:', error);
      return 0;
    }
  }
}

