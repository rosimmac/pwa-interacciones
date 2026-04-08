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

@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll(@Request() req): Promise<Cliente[]> {
    if (req.user.rol === 'admin') {
      return this.clientesService.findAll();
    } else {
      return this.clientesService.findAll(req.user.id);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Cliente> {
    return this.clientesService.findOne(+id);
  }

  @Post()
  create(@Request() req, @Body() data: Partial<Cliente>): Promise<Cliente> {
    return this.clientesService.create(data, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Cliente>,
  ): Promise<Cliente> {
    return this.clientesService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.clientesService.remove(+id);
  }
}
