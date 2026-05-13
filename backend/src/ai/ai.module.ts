import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './providers/gemini.service';
import { GroqService } from './providers/groq.service';
import { CerebrasService } from './providers/cerebras.service';

export const AI_PROVIDER_TOKEN = 'AI_PROVIDER_TOKEN';

@Module({
  imports: [ConfigModule],
  providers: [
    GeminiService,
    GroqService,
    CerebrasService,
    {
      provide: AI_PROVIDER_TOKEN,
      useFactory: (
        geminiService: GeminiService,
        groqService: GroqService,
        cerebrasService: CerebrasService,
      ) => {
        const providerName = (process.env.PROVEEDOR_IA || 'groq').toLowerCase();

        switch (providerName) {
          case 'gemini':
            return geminiService;
          case 'cerebras':
            return cerebrasService;
          case 'groq':
          default:
            return groqService;
        }
      },
      inject: [GeminiService, GroqService, CerebrasService],
    },
  ],
  exports: [AI_PROVIDER_TOKEN],
})
export class AiModule {}
