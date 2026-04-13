import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaccion } from './interaccion.entity';
import { CreateInteraccionDto } from './create-interaccion.dto';

@Injectable()
export class InteraccionesService {
  constructor(
    @InjectRepository(Interaccion)
    private interaccionesRepository: Repository<Interaccion>,
  ) {}

  findAll(usuarioId?: number): Promise<Interaccion[]> {
    if (usuarioId) {
      return this.interaccionesRepository.find({
        relations: ['cliente', 'usuario', 'tipo'],
        where: { usuarioId },
      });
    } else {
      return this.interaccionesRepository.find({
        relations: ['cliente', 'usuario', 'tipo'],
      });
    }
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

  async create(data: CreateInteraccionDto): Promise<Interaccion> {
    const parsed = { ...data, fecha: new Date(data.fecha) };
    debugger;
    const interaccion = this.interaccionesRepository.create(parsed);
    const saved = await this.interaccionesRepository.save(interaccion);
    return this.findOne(saved.id);
  }

  async update(
    id: number,
    data: Partial<CreateInteraccionDto>,
  ): Promise<Interaccion> {
    await this.findOne(id);
    const parsed = {
      ...data,
      fecha: data.fecha ? new Date(data.fecha) : undefined,
    };
    await this.interaccionesRepository.update(id, parsed);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.interaccionesRepository.delete(id);
  }
}
