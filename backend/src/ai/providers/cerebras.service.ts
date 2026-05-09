import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { IAPIService } from '../interfaces/ia-service.interface';
import { AnalisisCVDto } from '../dto/analisis-cv.dto';

@Injectable()
export class CerebrasService implements IAPIService {
  private readonly logger = new Logger(CerebrasService.name);
  private client: Cerebras;

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
      return { skills: [], experienciaAnios: 0, resumen: 'Configura CEREBRAS_API_KEY' };
    }

    try {
      const response: any = await this.client.chat.completions.create({
        model: 'llama3.1-8b',
        messages: [
          {
            role: 'user',
            content: `Analiza el siguiente CV y devuelve un JSON con: skills (array de strings), experienciaAnios (numero), resumen (string largo).
            
            CV:
            ${textoCV}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Cerebras no devolvió contenido');

      return JSON.parse(content) as AnalisisCVDto;
    } catch (error) {
      this.logger.error('Error en Cerebras:', error);
      return { skills: [], experienciaAnios: 0, resumen: 'Error en Cerebras' };
    }
  }

  async calcularMatch(perfilCV: string, ofertaTrabajo: string): Promise<number> {
    this.logger.log('Calculando Match con Cerebras (Low Token Mode)...');
    if (!this.client) return 0;

    try {
      const response: any = await this.client.chat.completions.create({
        model: 'llama3.1-8b',
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
        max_tokens: 20, // Solo necesitamos un JSON diminuto
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
