import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroAcceso } from './registro-acceso.entity';
import { RegistroAccesosService } from './registro-accesos.service';
import { RegistroAccesosController } from './registro-accesos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroAcceso])],
  controllers: [RegistroAccesosController],
  providers: [RegistroAccesosService],
  exports: [RegistroAccesosService],
})
export class RegistroAccesosModule {}
