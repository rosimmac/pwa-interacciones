import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './cliente.entity';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

/**
 * Módulo de clientes.
 * Registra la entidad Cliente en TypeORM y expone el controlador
 * y el servicio necesarios para gestionar los clientes de la aplicación.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Cliente])],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
