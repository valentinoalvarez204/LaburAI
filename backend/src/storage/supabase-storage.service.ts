import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private supabase: SupabaseClient;
  private readonly BUCKET = 'cvs';

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (url && key) {
      this.supabase = createClient(url, key);
    } else {
      this.logger.warn('SUPABASE_URL o SUPABASE_SERVICE_KEY no configurados. El storage estará deshabilitado.');
    }
  }

  async subirCV(fileBuffer: Buffer, fileNameInfo: string, candidatoId: string): Promise<string> {
    // Si Supabase no está configurado, devolvemos un warning
    if (!this.supabase) {
      this.logger.warn('Supabase no configurado, necesitas activarlo para procesar CVs en memoria.');
      return '';
    }

    try {
      const fileName = `${candidatoId}/${Date.now()}-${fileNameInfo}`;

      const { data, error } = await this.supabase.storage
        .from(this.BUCKET)
        .upload(fileName, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true, // Si ya existe un CV del mismo candidato, lo sobreescribe
        });

      if (error) throw error;

      // Obtenemos la URL pública del archivo
      const { data: urlData } = this.supabase.storage
        .from(this.BUCKET)
        .getPublicUrl(data.path);

      this.logger.log(`CV subido a Supabase Storage: ${urlData.publicUrl}`);

      return urlData.publicUrl;
    } catch (error) {
      this.logger.error('Error al subir CV a Supabase Storage:', error.message);
      return '';
    }
  }
}
