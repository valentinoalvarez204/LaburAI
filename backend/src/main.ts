import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Permite que el frontend se conecte al backend
  app.enableCors({
    origin: '*',
  });

  // Valida los datos que llegan al backend
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Todas las rutas empiezan con /api
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('🚀 LaburAI backend corriendo en http://localhost:3000/api');
}
bootstrap();