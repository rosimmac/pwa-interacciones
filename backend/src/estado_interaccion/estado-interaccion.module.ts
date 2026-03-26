import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoInteraccion } from './estado-interaccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoInteraccion])],
  exports: [TypeOrmModule],
})
export class EstadoInteraccionModule {}
