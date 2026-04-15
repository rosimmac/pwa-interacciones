import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsuariosModule } from '../usuarios/usuarios.module';

import { RegistroAccesosModule } from '../registro_accesos/registro-accesos.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

/**
 * Módulo de autenticación.
 * Configura Passport y JWT para proteger las rutas de la aplicación.
 * - El token JWT tiene una validez de 8 horas.
 * - La clave secreta se lee desde la variable de entorno JWT_SECRET.
 * - Importa UsuariosModule para validar credenciales y RegistroAccesosModule
 *   para registrar los accesos de los usuarios.
 */
@Module({
  imports: [
    UsuariosModule,
    RegistroAccesosModule,
    PassportModule,
    // Configuración asíncrona del módulo JWT para leer el secreto desde .env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
