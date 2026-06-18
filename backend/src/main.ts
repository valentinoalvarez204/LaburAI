import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Permite que el frontend se conecte al backend
  app.enableCors({
    origin: [
      'https://labur-ai.vercel.app',
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://127.0.0.1:8080',
    ],
    credentials: true,
  });

  // Valida los datos que llegan al backend
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Sirve los archivos subidos (ej: CVs en /uploads/cvs/)
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Todas las rutas empiezan con /api
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('🚀 LaburAI backend corriendo en http://localhost:3000/api');
}
bootstrap();