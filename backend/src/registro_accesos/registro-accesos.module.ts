import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroAcceso } from './registro-acceso.entity';
import { RegistroAccesosService } from './registro-accesos.service';

/**
 * Módulo de registro de accesos.
 * Registra la entidad RegistroAcceso en TypeORM y expone el servicio
 * para guardar eventos de login/logout.
 * Exporta RegistroAccesosService para que AuthModule pueda utilizarlo.
 */
@Module({
  imports: [TypeOrmModule.forFeature([RegistroAcceso])],
  providers: [RegistroAccesosService],
  exports: [RegistroAccesosService],
})
export class RegistroAccesosModule {}
