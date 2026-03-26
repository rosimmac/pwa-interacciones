import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroAcceso } from './registro-acceso.entity';
import { RegistroAccesosService } from './registro-accesos.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroAcceso])],
  providers: [RegistroAccesosService],
  exports: [RegistroAccesosService],
})
export class RegistroAccesosModule {}
