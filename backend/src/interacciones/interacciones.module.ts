import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interaccion } from './interaccion.entity';
import { InteraccionesController } from './interacciones.controller';
import { InteraccionesService } from './interacciones.service';

/**
 * Módulo de interacciones.
 * Registra la entidad Interaccion en TypeORM y expone el controlador
 * y el servicio para gestionar las interacciones con clientes.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Interaccion])],
  controllers: [InteraccionesController],
  providers: [InteraccionesService],
})
export class InteraccionesModule {}
