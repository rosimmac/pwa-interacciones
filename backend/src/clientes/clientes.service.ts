// ─────────────────────────────────────────────────────────────────────────────
// CLIENTES SERVICE
// Contiene la lógica de negocio del CRUD de clientes.
// Se comunica con la BD a través del repositorio de TypeORM inyectado.
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // Decorador para inyectar el repositorio de TypeORM
import { Repository } from 'typeorm'; // Tipo genérico del repositorio de TypeORM
import { Cliente } from './cliente.entity'; // Entidad que mapea la tabla "clientes" en BD
import { CreateClienteDto } from './dto/create-cliente.dto'; // DTO con los datos validados que llegan del cliente

// @Injectable() registra este service en el sistema de inyección de dependencias de NestJS
@Injectable()
export class ClientesService {
  constructor(
    // @InjectRepository(Cliente) le indica a NestJS qué repositorio inyectar.
    // TypeORM genera automáticamente un repositorio por cada entidad registrada en el módulo.
    // Este repositorio expone métodos como find(), findOneBy(), save(), update(), delete()
    // que traducen nuestras llamadas a queries SQL sin que tengamos que escribirlas.
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
  ) {}

  // ─────────────────────────────────────────────
  // FIND ALL
  // Devuelve todos los clientes o solo los del usuario indicado.
  // El parámetro usuarioId es opcional (?) — si no se pasa, devuelve todos.
  // Esto permite que un admin vea todos los clientes y un user solo los suyos.
  // ─────────────────────────────────────────────
  findAll(usuarioId?: number): Promise<Cliente[]> {
    if (usuarioId) {
      // Si se proporciona usuarioId, filtramos por ese campo (WHERE usuarioId = X)
      return this.clientesRepository.find({ where: { usuarioId } });
    } else {
      // Sin filtro devolvemos todos los registros de la tabla
      return this.clientesRepository.find();
    }
  }

  // ─────────────────────────────────────────────
  // FIND ONE
  // Busca un cliente por su id primario.
  // Lanza NotFoundException (HTTP 404) si no existe.
  // Este método también lo usan update() y remove() para verificar
  // que el cliente existe antes de operar sobre él.
  // ─────────────────────────────────────────────
  async findOne(id: number): Promise<Cliente> {
    // findOneBy() busca un registro por el campo indicado (WHERE id = X).
    // Devuelve el objeto cliente o null si no encuentra nada.
    const cliente = await this.clientesRepository.findOneBy({ id });

    // Si no existe el cliente lanzamos NotFoundException (HTTP 404).
    // El mensaje incluye el id para facilitar el debugging.
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);

    return cliente;
  }

  // ─────────────────────────────────────────────
  // CREATE
  // Crea un nuevo cliente a partir de los datos del DTO y el id del usuario autenticado.
  // El usuarioId viene del token JWT (extraído por el guard), no del body de la petición,
  // para evitar que un usuario pueda crear clientes asignados a otro usuario.
  // ─────────────────────────────────────────────
  create(data: CreateClienteDto, usuarioId: number): Promise<Cliente> {
    // Construimos el objeto con los datos que irán a BD.
    // fechaCreacion se asigna aquí en el servidor, no se acepta del cliente
    // para garantizar que siempre sea la fecha real de creación.
    const newCliente = {
      nombre: data.nombre,
      fechaCreacion: new Date(), // Fecha actual en el momento de la creación
      usuarioId: usuarioId, // Asociamos el cliente al usuario autenticado
    };

    // create() instancia la entidad Cliente con los datos proporcionados.
    // No persiste en BD todavía — solo crea el objeto TypeORM.
    const cliente = this.clientesRepository.create(newCliente);

    // save() ejecuta el INSERT en BD y devuelve la entidad con el id generado.
    return this.clientesRepository.save(cliente);
  }

  // ─────────────────────────────────────────────
  // UPDATE
  // Actualiza los datos de un cliente existente.
  // Primero verifica que existe (findOne lanza 404 si no),
  // luego actualiza y devuelve el cliente con los datos nuevos.
  // Partial<CreateClienteDto> permite actualizar solo algunos campos, no todos.
  // ─────────────────────────────────────────────
  async update(id: number, data: Partial<CreateClienteDto>): Promise<Cliente> {
    // Verificamos que el cliente existe antes de intentar actualizarlo.
    // Si no existe, findOne lanza NotFoundException y la ejecución se detiene aquí.
    await this.findOne(id);

    // update() ejecuta un UPDATE en BD para el registro con ese id.
    // No devuelve la entidad actualizada — por eso necesitamos el findOne posterior.
    await this.clientesRepository.update(id, data);

    // Devolvemos el cliente con los datos ya actualizados desde BD
    return this.findOne(id);
  }

  // ─────────────────────────────────────────────
  // REMOVE
  // Elimina un cliente por id.
  // Primero verifica que existe para devolver 404 si no,
  // en lugar del silencio de delete() que no lanza error si no encuentra el registro.
  // ─────────────────────────────────────────────
  async remove(id: number): Promise<void> {
    // Verificamos que el cliente existe antes de intentar eliminarlo.
    // Sin este check, delete() no lanzaría error aunque el id no existiera,
    // y el cliente recibiría un 200 OK aunque no se borrara nada.
    await this.findOne(id);

    // delete() ejecuta el DELETE en BD para el registro con ese id.
    await this.clientesRepository.delete(id);
  }
}
