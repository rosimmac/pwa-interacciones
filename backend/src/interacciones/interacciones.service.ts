// ─────────────────────────────────────────────────────────────────────────────
// INTERACCIONES SERVICE
// Contiene la lógica de negocio del CRUD de interacciones.
// A diferencia de ClientesService, aquí siempre cargamos las relaciones
// (cliente, usuario, tipo) porque el frontend las necesita para mostrar
// nombres en lugar de solo ids.
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // Decorador para inyectar el repositorio de TypeORM
import { Repository } from 'typeorm'; // Tipo genérico del repositorio de TypeORM
import { Interaccion } from './interaccion.entity'; // Entidad que mapea la tabla "interaccion" en BD
import { CreateInteraccionDto } from './dto/create-interaccion.dto'; // DTO con los datos validados del cliente

// @Injectable() registra este service en el sistema de inyección de dependencias de NestJS
@Injectable()
export class InteraccionesService {
  constructor(
    // @InjectRepository(Interaccion) inyecta el repositorio generado por TypeORM
    // para la entidad Interaccion, con todos sus métodos de acceso a BD.
    @InjectRepository(Interaccion)
    private interaccionesRepository: Repository<Interaccion>,
  ) {}

  // ─────────────────────────────────────────────
  // FIND ALL
  // Devuelve todas las interacciones o solo las del usuario indicado.
  // Siempre carga las relaciones porque el frontend necesita mostrar
  // el nombre del cliente, del usuario y del tipo — no solo sus ids.
  // ─────────────────────────────────────────────
  findAll(usuarioId?: number): Promise<Interaccion[]> {
    if (usuarioId) {
      // Con filtro: solo las interacciones de ese usuario (WHERE id_usuario = X)
      // relations indica a TypeORM qué JOINs hacer para cargar las entidades relacionadas
      return this.interaccionesRepository.find({
        relations: ['cliente', 'usuario', 'tipo'],
        where: { usuarioId },
      });
    } else {
      // Sin filtro: todas las interacciones con sus relaciones
      return this.interaccionesRepository.find({
        relations: ['cliente', 'usuario', 'tipo'],
      });
    }
  }

  // ─────────────────────────────────────────────
  // FIND BY USUARIO
  // Método dedicado para obtener las interacciones de un usuario concreto.
  // A diferencia de findAll(usuarioId), este método siempre requiere el id —
  // no es opcional. Se usa cuando sabemos con certeza que queremos filtrar.
  // ─────────────────────────────────────────────
  findByUsuario(usuarioId: number): Promise<Interaccion[]> {
    return this.interaccionesRepository.find({
      where: { usuarioId },
      relations: ['cliente', 'usuario', 'tipo'],
    });
  }

  // ─────────────────────────────────────────────
  // FIND ONE
  // Busca una interacción por su id primario cargando sus relaciones.
  // Lanza NotFoundException (HTTP 404) si no existe.
  // También lo usan create(), update() y remove() internamente.
  // ─────────────────────────────────────────────
  async findOne(id: number): Promise<Interaccion> {
    // A diferencia de ClientesService, aquí usamos findOne() en lugar de findOneBy()
    // porque necesitamos pasar la opción relations para cargar las entidades relacionadas.
    // findOneBy() no acepta esa opción.
    const interaccion = await this.interaccionesRepository.findOne({
      where: { id },
      relations: ['cliente', 'usuario', 'tipo'],
    });

    // Si no existe lanzamos NotFoundException (HTTP 404) con el id en el mensaje
    if (!interaccion)
      throw new NotFoundException(`Interaccion ${id} no encontrada`);

    return interaccion;
  }

  // ─────────────────────────────────────────────
  // CREATE
  // Crea una nueva interacción a partir de los datos del DTO.
  // La fecha llega como string ISO desde el frontend y se convierte a Date
  // antes de persistir, porque la columna en BD es de tipo datetime.
  // Tras guardar, llama a findOne() para devolver la interacción con
  // todas sus relaciones ya cargadas.
  // ─────────────────────────────────────────────
  async create(data: CreateInteraccionDto): Promise<Interaccion> {
    // Convertimos la fecha de string ISO ('2024-01-01') a objeto Date.
    // El DTO usa @IsDateString() para validar el formato, pero TypeORM
    // espera un objeto Date para columnas de tipo datetime.
    const parsed = { ...data, fecha: new Date(data.fecha) };

    // create() instancia la entidad con los datos — no persiste todavía
    const interaccion = this.interaccionesRepository.create(parsed);

    // save() ejecuta el INSERT en BD y devuelve la entidad con el id generado
    const saved = await this.interaccionesRepository.save(interaccion);

    // Llamamos a findOne() con el id recién generado para devolver la interacción
    // completa con sus relaciones cargadas (cliente, usuario, tipo).
    // save() no carga relaciones — por eso necesitamos este paso extra.
    return this.findOne(saved.id);
  }

  // ─────────────────────────────────────────────
  // UPDATE
  // Actualiza los datos de una interacción existente.
  // Convierte la fecha a Date si se proporciona, la omite si no.
  // Devuelve la interacción actualizada con sus relaciones.
  // ─────────────────────────────────────────────
  async update(
    id: number,
    data: Partial<CreateInteraccionDto>, // Partial permite actualizar solo algunos campos
  ): Promise<Interaccion> {
    // Verificamos que la interacción existe antes de actualizar.
    // Si no existe, findOne lanza NotFoundException y la ejecución se detiene aquí.
    await this.findOne(id);

    // Procesamos los datos: si viene fecha la convertimos a Date, si no viene
    // la dejamos como undefined para que TypeORM no sobreescriba el valor existente en BD.
    const parsed = {
      ...data,
      fecha: data.fecha ? new Date(data.fecha) : undefined,
    };

    // update() ejecuta el UPDATE en BD — no devuelve la entidad actualizada
    await this.interaccionesRepository.update(id, parsed);

    // Devolvemos la interacción actualizada con las relaciones cargadas
    return this.findOne(id);
  }

  // ─────────────────────────────────────────────
  // REMOVE
  // Elimina una interacción por id.
  // Verifica que existe antes de borrar para devolver 404 si no,
  // en lugar del silencio de delete() que no lanza error si no encuentra el registro.
  // ─────────────────────────────────────────────
  async remove(id: number): Promise<void> {
    // Verificamos que la interacción existe — lanza 404 si no
    await this.findOne(id);

    // delete() ejecuta el DELETE en BD para el registro con ese id
    await this.interaccionesRepository.delete(id);
  }
}
