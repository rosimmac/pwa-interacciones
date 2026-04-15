import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoInteraccion } from './tipo-interaccion.entity';

/**
 * Módulo de tipos de interacción.
 * Registra la entidad TipoInteraccion en TypeORM y exporta el módulo
 * para que otros módulos (p.ej. InteraccionesModule) puedan usar su repositorio.
 */
@Module({
  imports: [TypeOrmModule.forFeature([TipoInteraccion])],
  exports: [TypeOrmModule],
})
export class TipoInteraccionModule {}
