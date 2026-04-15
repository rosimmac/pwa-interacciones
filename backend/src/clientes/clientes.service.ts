import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';

/**
 * Servicio de clientes.
 * Encapsula la lógica de negocio del CRUD de clientes
 * y su acceso a la base de datos mediante el repositorio de TypeORM.
 */
@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
  ) {}

  /**
   * Devuelve la lista de clientes. Si se proporciona un usuarioId, filtra
   * por ese usuario; de lo contrario devuelve todos los registros.
   *
   * @param usuarioId - ID del usuario propietario. Opcional (solo admin omite este parámetro).
   */
  findAll(usuarioId?: number): Promise<Cliente[]> {
    if (usuarioId) {
      return this.clientesRepository.find({ where: { usuarioId } });
    }
    return this.clientesRepository.find();
  }

  /**
   * Devuelve un cliente por su clave primaria.
   *
   * @param id - ID del cliente.
   * @throws NotFoundException si el cliente no existe.
   */
  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOneBy({ id });
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return cliente;
  }

  /**
   * Crea un nuevo cliente asociado al usuario autenticado.
   * La fecha de creación se asigna en servidor para garantizar su integridad.
   *
   * @param data - Datos validados del nuevo cliente.
   * @param usuarioId - ID del usuario autenticado (extraído del token JWT).
   */
  create(data: CreateClienteDto, usuarioId: number): Promise<Cliente> {
    const cliente = this.clientesRepository.create({
      nombre: data.nombre,
      fechaCreacion: new Date(),
      usuarioId,
    });
    return this.clientesRepository.save(cliente);
  }

  /**
   * Actualiza los campos indicados de un cliente existente.
   *
   * @param id - ID del cliente a actualizar.
   * @param data - Campos a modificar (parciales).
   * @throws NotFoundException si el cliente no existe.
   */
  async update(id: number, data: Partial<CreateClienteDto>): Promise<Cliente> {
    await this.findOne(id);
    await this.clientesRepository.update(id, data);
    return this.findOne(id);
  }

  /**
   * Elimina un cliente por su clave primaria.
   *
   * @param id - ID del cliente a eliminar.
   * @throws NotFoundException si el cliente no existe.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.clientesRepository.delete(id);
  }
}
