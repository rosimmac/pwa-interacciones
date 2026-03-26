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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT') ?? '3306'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
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
