import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoInteraccion } from './tipo-interaccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoInteraccion])],
  exports: [TypeOrmModule],
})
export class TipoInteraccionModule {}
