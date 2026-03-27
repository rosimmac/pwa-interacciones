import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaccion } from './interaccion.entity';

@Injectable()
export class InteraccionesService {
  constructor(
    @InjectRepository(Interaccion)
    private interaccionesRepository: Repository<Interaccion>,
  ) {}

  findAll(): Promise<Interaccion[]> {
    return this.interaccionesRepository.find({
      relations: ['cliente', 'usuario', 'tipo'],
    });
  }

  findByUsuario(usuarioId: number): Promise<Interaccion[]> {
    return this.interaccionesRepository.find({
      where: { usuarioId },
      relations: ['cliente', 'usuario', 'tipo'],
    });
  }

  async findOne(id: number): Promise<Interaccion> {
    const interaccion = await this.interaccionesRepository.findOne({
      where: { id },
      relations: ['cliente', 'usuario', 'tipo'],
    });
    if (!interaccion)
      throw new NotFoundException(`Interaccion ${id} no encontrada`);
    return interaccion;
  }

  create(data: Partial<Interaccion>): Promise<Interaccion> {
    const interaccion = this.interaccionesRepository.create(data);
    return this.interaccionesRepository.save(interaccion);
  }

  async update(id: number, data: Partial<Interaccion>): Promise<Interaccion> {
    await this.findOne(id);
    await this.interaccionesRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.interaccionesRepository.delete(id);
  }
}
