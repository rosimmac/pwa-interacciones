import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
  ) {}

  findAll(usuarioId?: number): Promise<Cliente[]> {
    if (usuarioId) {
      return this.clientesRepository.find({ where: { usuarioId } });
    } else {
      return this.clientesRepository.find();
    }
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOneBy({ id });
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return cliente;
  }

  create(data: Partial<Cliente>, usuarioId: number): Promise<Cliente> {
    const newCliente = {
      nombre: data.nombre,
      fechaCreacion: new Date(),
      usuarioId: usuarioId,
    };
    const cliente = this.clientesRepository.create(newCliente);
    return this.clientesRepository.save(cliente);
  }

  async update(id: number, data: Partial<Cliente>): Promise<Cliente> {
    await this.findOne(id);
    await this.clientesRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.clientesRepository.delete(id);
  }
}
