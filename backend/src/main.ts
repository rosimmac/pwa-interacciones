import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * Punto de entrada de la aplicación NestJS.
 * Configura CORS, el prefijo global de rutas y la validación de DTOs,
 * y arranca el servidor HTTP en el puerto 3000.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite peticiones desde el frontend (Vite dev, preview y producción en Vercel)
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://pwa-interacciones.vercel.app',
    ],
    credentials: true, // Necesario para enviar cookies o headers de autorización
  });

  // Todas las rutas quedan bajo /api (ej: /api/auth/login, /api/clientes)
  app.setGlobalPrefix('api');

  // ValidationPipe aplica automáticamente las validaciones de los DTOs en todos los endpoints.
  // whitelist:true elimina del body cualquier propiedad no declarada en el DTO,
  // protegiendo contra inyección de campos no esperados.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(3000);
}
bootstrap();
