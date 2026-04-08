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

@UseGuards(JwtAuthGuard)
@Controller('interacciones')
export class InteraccionesController {
  constructor(private readonly interaccionesService: InteraccionesService) {}

  @Get()
  findAll(@Request() req): Promise<Interaccion[]> {
    if (req.user.rol === 'admin') {
      return this.interaccionesService.findAll();
    } else {
      return this.interaccionesService.findAll(req.user.id);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Interaccion> {
    return this.interaccionesService.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<Interaccion>): Promise<Interaccion> {
    return this.interaccionesService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Interaccion>,
  ): Promise<Interaccion> {
    return this.interaccionesService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.interaccionesService.remove(+id);
  }
}
