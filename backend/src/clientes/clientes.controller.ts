import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { Cliente } from './cliente.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateClienteDto } from './dto/create-cliente.dto';

/**
 * Controlador de clientes.
 * Todas las rutas están protegidas con JWT.
 * Los administradores pueden ver todos los clientes;
 * los demás roles solo ven los clientes que ellos mismos crearon.
 */
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  /**
   * GET /clientes — Devuelve la lista de clientes.
   * Admin: todos los clientes. Otros roles: solo los propios.
   */
  @Get()
  findAll(@Request() req): Promise<Cliente[]> {
    if (req.user.rol === 'admin') {
      return this.clientesService.findAll();
    } else {
      return this.clientesService.findAll(req.user.id);
    }
  }

  /** GET /clientes/:id — Devuelve un cliente por su ID. */
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Cliente> {
    return this.clientesService.findOne(+id);
  }

  /** POST /clientes — Crea un nuevo cliente asociado al usuario autenticado. */
  @Post()
  create(@Request() req, @Body() data: CreateClienteDto): Promise<Cliente> {
    return this.clientesService.create(data, req.user.id);
  }

  /** PATCH /clientes/:id — Actualiza los datos de un cliente existente. */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<CreateClienteDto>,
  ): Promise<Cliente> {
    return this.clientesService.update(+id, data);
  }

  /** DELETE /clientes/:id — Elimina un cliente por su ID. */
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.clientesService.remove(+id);
  }
}
