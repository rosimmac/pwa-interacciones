import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { RolesGuard } from '../auth/roles.guard';

/**
 * Módulo de usuarios.
 * Registra la entidad Usuario en TypeORM y proporciona el controlador,
 * el servicio y el guard de roles.
 * Exporta UsuariosService para que AuthModule pueda validar credenciales.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuariosController],
  providers: [UsuariosService, RolesGuard],
  // UsuariosService se exporta para ser inyectado en AuthModule
  exports: [UsuariosService],
})
export class UsuariosModule {}
