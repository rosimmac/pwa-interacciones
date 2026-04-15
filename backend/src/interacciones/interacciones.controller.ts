import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { InteraccionesService } from './interacciones.service';
import { Interaccion } from './interaccion.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateInteraccionDto } from './dto/create-interaccion.dto';

/**
 * Controlador de interacciones.
 * Todas las rutas están protegidas con JWT.
 * Los administradores pueden ver todas las interacciones;
 * los demás roles solo ven las interacciones de sus propios clientes.
 */
@UseGuards(JwtAuthGuard)
@Controller('interacciones')
export class InteraccionesController {
  constructor(private readonly interaccionesService: InteraccionesService) {}

  /**
   * GET /interacciones — Devuelve la lista de interacciones.
   * Admin: todas las interacciones. Otros roles: solo las propias.
   */
  @Get()
  findAll(@Request() req): Promise<Interaccion[]> {
    if (req.user.rol === 'admin') {
      return this.interaccionesService.findAll();
    } else {
      return this.interaccionesService.findAll(req.user.id);
    }
  }

  /** GET /interacciones/:id — Devuelve una interacción por su ID. */
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Interaccion> {
    return this.interaccionesService.findOne(+id);
  }

  /** POST /interacciones — Registra una nueva interacción. */
  @Post()
  create(@Body() data: CreateInteraccionDto): Promise<Interaccion> {
    return this.interaccionesService.create(data);
  }

  /** PATCH /interacciones/:id — Actualiza una interacción existente. */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<CreateInteraccionDto>,
  ): Promise<Interaccion> {
    return this.interaccionesService.update(+id, data);
  }

  /** DELETE /interacciones/:id — Elimina una interacción por su ID. */
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.interaccionesService.remove(+id);
  }
}
