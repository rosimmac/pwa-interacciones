import { Controller, Get, UseGuards } from '@nestjs/common';
import { RegistroAccesosService } from './registro-accesos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('registro-accesos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistroAccesosController {
  constructor(
    private readonly registroAccesosService: RegistroAccesosService,
  ) {}

  @Get()
  @Roles('admin')
  findAll() {
    return this.registroAccesosService.findAll();
  }
}
