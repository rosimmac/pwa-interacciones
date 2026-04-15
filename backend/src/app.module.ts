import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from './clientes/clientes.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { InteraccionesModule } from './interacciones/interacciones.module';
import { TipoInteraccionModule } from './tipo_interaccion/tipo-interaccion.module';
import { EstadoInteraccionModule } from './estado_interaccion/estado-interaccion.module';
import { RegistroAccesosModule } from './registro_accesos/registro-accesos.module';
import { AuthModule } from './auth/auth.module';

/**
 * Módulo raíz de la aplicación.
 * - Carga las variables de entorno de forma global con ConfigModule.
 * - Configura la conexión a MySQL con TypeORM leyendo los parámetros desde .env.
 * - Registra todos los módulos de dominio: clientes, usuarios, interacciones,
 *   tipos y estados de interacción, registro de accesos y autenticación.
 */
@Module({
  imports: [
    // Hace disponibles las variables de entorno en toda la aplicación
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a MySQL configurada de forma asíncrona a partir de variables de entorno
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT') ?? '3306'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        // Detecta automáticamente todas las entidades del proyecto
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize:false para no alterar el esquema en producción
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ClientesModule,
    UsuariosModule,
    InteraccionesModule,
    TipoInteraccionModule,
    EstadoInteraccionModule,
    RegistroAccesosModule,
    AuthModule,
  ],
})
export class AppModule {}
