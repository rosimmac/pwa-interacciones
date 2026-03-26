import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { Cliente } from './cliente.entity';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll(): Promise<Cliente[]> {
    return this.clientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Cliente> {
    return this.clientesService.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<Cliente>): Promise<Cliente> {
    return this.clientesService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Cliente>): Promise<Cliente> {
    return this.clientesService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.clientesService.remove(+id);
  }
}