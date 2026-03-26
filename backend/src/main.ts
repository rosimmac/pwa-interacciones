import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173', // puerto de Vite
    credentials: true,
  });

  app.setGlobalPrefix('api'); // todas las rutas empezarán por /api

  await app.listen(3000);
}
bootstrap();
