import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaccion } from './interaccion.entity';
import { CreateInteraccionDto } from './dto/create-interaccion.dto';

/**
 * Servicio de interacciones.
 * Gestiona el CRUD de interacciones con clientes.
 * Todas las consultas cargan las relaciones necesarias (cliente, usuario, tipo)
 * para que el frontend reciba nombres en lugar de solo identificadores.
 */
@Injectable()
export class InteraccionesService {
  constructor(
    @InjectRepository(Interaccion)
    private interaccionesRepository: Repository<Interaccion>,
  ) {}

  /**
   * Devuelve la lista de interacciones con sus relaciones cargadas.
   * Si se proporciona un usuarioId, filtra por ese usuario;
   * de lo contrario devuelve todas las interacciones.
   *
   * @param usuarioId - ID del usuario propietario. Opcional (solo admin omite este parámetro).
   */
  findAll(usuarioId?: number): Promise<Interaccion[]> {
    if (usuarioId) {
      return this.interaccionesRepository.find({
        relations: ['cliente', 'usuario', 'tipo'],
        where: { usuarioId },
      });
    }
    return this.interaccionesRepository.find({
      relations: ['cliente', 'usuario', 'tipo'],
    });
  }

  /**
   * Devuelve todas las interacciones de un usuario concreto con sus relaciones cargadas.
   *
   * @param usuarioId - ID del usuario propietario.
   */
  findByUsuario(usuarioId: number): Promise<Interaccion[]> {
    return this.interaccionesRepository.find({
      where: { usuarioId },
      relations: ['cliente', 'usuario', 'tipo'],
    });
  }

  /**
   * Devuelve una interacción por su clave primaria con las relaciones cargadas.
   *
   * @param id - ID de la interacción.
   * @throws NotFoundException si la interacción no existe.
   */
  async findOne(id: number): Promise<Interaccion> {
    const interaccion = await this.interaccionesRepository.findOne({
      where: { id },
      relations: ['cliente', 'usuario', 'tipo'],
    });
    if (!interaccion)
      throw new NotFoundException(`Interaccion ${id} no encontrada`);
    return interaccion;
  }

  /**
   * Crea una nueva interacción. La fecha se convierte de string ISO a Date
   * antes de persistir, ya que la columna en BD es de tipo datetime.
   * Devuelve la interacción creada con todas sus relaciones cargadas.
   *
   * @param data - Datos validados de la nueva interacción.
   */
  async create(data: CreateInteraccionDto): Promise<Interaccion> {
    const parsed = { ...data, fecha: new Date(data.fecha) };
    const interaccion = this.interaccionesRepository.create(parsed);
    const saved = await this.interaccionesRepository.save(interaccion);
    return this.findOne(saved.id);
  }

  /**
   * Actualiza los campos indicados de una interacción existente.
   * Si se incluye una nueva fecha, se convierte a Date antes de persistir.
   *
   * @param id - ID de la interacción a actualizar.
   * @param data - Campos a modificar (parciales).
   * @throws NotFoundException si la interacción no existe.
   */
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

  /**
   * Elimina una interacción por su clave primaria.
   *
   * @param id - ID de la interacción a eliminar.
   * @throws NotFoundException si la interacción no existe.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.interaccionesRepository.delete(id);
  }
}
