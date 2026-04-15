import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoInteraccion } from './estado-interaccion.entity';

/**
 * Módulo de estados de interacción.
 * Registra la entidad EstadoInteraccion en TypeORM y exporta el módulo
 * para que otros módulos (p.ej. InteraccionesModule) puedan usar su repositorio.
 */
@Module({
  imports: [TypeOrmModule.forFeature([EstadoInteraccion])],
  exports: [TypeOrmModule],
})
export class EstadoInteraccionModule {}
