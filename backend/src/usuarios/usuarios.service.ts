// ─────────────────────────────────────────────────────────────────────────────
// USUARIOS SERVICE
// Contiene la lógica de negocio del CRUD de usuarios.
//
// Aspectos de seguridad clave de este service:
//   - La password NUNCA se devuelve en las respuestas (se elimina con destructuring)
//   - La password siempre se hashea con bcrypt antes de persistir en BD
//   - findByEmail devuelve null en lugar de lanzar excepción (lo necesita AuthService)
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // Decorador para inyectar el repositorio de TypeORM
import { Repository } from 'typeorm'; // Tipo genérico del repositorio de TypeORM
import * as bcrypt from 'bcryptjs'; // Librería para hashear contraseñas de forma segura
import { Usuario } from './usuario.entity'; // Entidad que mapea la tabla "usuario" en BD
import { CreateUsuarioDto } from './dto/create.usuario.dto'; // DTO con los datos validados del cliente

// @Injectable() registra este service en el sistema de inyección de dependencias de NestJS
@Injectable()
export class UsuariosService {
  constructor(
    // @InjectRepository(Usuario) inyecta el repositorio generado por TypeORM para la entidad Usuario
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  // ─────────────────────────────────────────────
  // FIND ALL
  // Devuelve todos los usuarios excluyendo la password.
  // Usamos select para indicar a TypeORM qué columnas traer en la query SQL —
  // así la password nunca viaja por la red aunque el cliente la pida.
  // ─────────────────────────────────────────────
  findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find({
      select: ['id', 'nombre', 'email', 'rol'], // SEGURIDAD: nunca devolver password ni tokens
    });
  }

  // ─────────────────────────────────────────────
  // FIND ONE
  // Busca un usuario por su id primario.
  // Lanza NotFoundException (HTTP 404) si no existe.
  // También lo usan update() y remove() para verificar que el usuario existe.
  // ─────────────────────────────────────────────
  async findOne(id: number): Promise<Usuario> {
    // findOneBy() busca por el campo indicado — devuelve el usuario o null
    const usuario = await this.usuariosRepository.findOneBy({ id });

    // Si no existe lanzamos 404 con el id en el mensaje para facilitar el debugging
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);

    return usuario;
  }

  // ─────────────────────────────────────────────
  // FIND BY EMAIL
  // Busca un usuario por su email. Devuelve null si no existe.
  // A diferencia de findOne(), NO lanza excepción cuando no encuentra resultado —
  // AuthService necesita recibir null para gestionar el caso de email no registrado
  // sin exponer si el email existe o no (seguridad anti-enumeración).
  // ─────────────────────────────────────────────
  async findByEmail(email: string): Promise<Usuario | null> {
    // Devuelve el usuario completo (incluyendo password) porque AuthService
    // necesita el hash para compararlo con la contraseña recibida en el login
    return this.usuariosRepository.findOneBy({ email });
  }

  // ─────────────────────────────────────────────
  // CREATE
  // Crea un nuevo usuario hasheando su contraseña antes de persistir.
  // Devuelve el usuario creado SIN la password mediante destructuring.
  // El tipo de retorno Omit<Usuario, 'password'> garantiza a nivel de TypeScript
  // que la password nunca formará parte de la respuesta.
  // ─────────────────────────────────────────────
  async create(data: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    // Hasheamos la contraseña antes de guardarla.
    // bcrypt.hash() genera un salt aleatorio y lo incorpora al hash resultante,
    // por eso cada hash es diferente aunque la contraseña sea la misma.
    // El factor de coste 10 es el estándar recomendado.
    // NUNCA guardamos contraseñas en texto plano.
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // create() instancia la entidad con los datos — no persiste todavía
    const usuario = this.usuariosRepository.create(data);

    // save() ejecuta el INSERT en BD y devuelve la entidad con el id generado
    const guardado = await this.usuariosRepository.save(usuario);

    // Eliminamos la password del objeto antes de devolverlo.
    // La sintaxis "{ password: _, ...resto }" extrae password en la variable _
    // (convención para variables ignoradas) y agrupa el resto de propiedades en "resto".
    // Así garantizamos que la password nunca llega al controlador ni al cliente.
    const { password: _, ...resto } = guardado;
    return resto;
  }

  // ─────────────────────────────────────────────
  // UPDATE
  // Actualiza los datos de un usuario existente.
  // Si se actualiza la password, se hashea antes de guardar.
  // Usa merge() para fusionar el usuario existente con los nuevos datos,
  // preservando los campos que no se actualizan.
  // Devuelve el usuario actualizado SIN la password.
  // ─────────────────────────────────────────────
  async update(
    id: number,
    data: Partial<CreateUsuarioDto>, // Partial permite actualizar solo algunos campos
  ): Promise<Omit<Usuario, 'password'>> {
    // Verificamos que el usuario existe — lanza 404 si no
    const usuario = await this.findOne(id);

    // Si se incluye una nueva password en el update, la hasheamos antes de guardar
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // merge() fusiona la entidad existente con los nuevos datos.
    // A diferencia de Object.assign(), TypeORM merge() respeta el contexto
    // de la entidad y sus metadatos, lo que garantiza que el save() posterior
    // funcione correctamente con el sistema de seguimiento de cambios de TypeORM.
    const actualizado = this.usuariosRepository.merge(usuario, data);

    // save() detecta que la entidad ya existe (tiene id) y ejecuta un UPDATE en BD
    const guardado = await this.usuariosRepository.save(actualizado);

    // Eliminamos la password del resultado antes de devolver, igual que en create()
    const { password: _, ...resto } = guardado;
    return resto;
  }

  // ─────────────────────────────────────────────
  // REMOVE
  // Elimina un usuario por id.
  // Verifica que existe antes de borrar para devolver 404 si no,
  // en lugar del silencio de delete() que no lanza error si no encuentra el registro.
  // ─────────────────────────────────────────────
  async remove(id: number): Promise<void> {
    // Verificamos que el usuario existe — lanza 404 si no
    await this.findOne(id);

    // delete() ejecuta el DELETE en BD para el registro con ese id
    await this.usuariosRepository.delete(id);
  }

  // ─────────────────────────────────────────────
  // GUARDAR RESET TOKEN
  // Guarda o limpia el token de recuperación de contraseña de un usuario.
  // Se llama con un token y fecha cuando se solicita el reset,
  // y con null, null después de que el reset se completa para invalidarlo.
  //
  // Usa QueryBuilder en lugar de update() + save() porque necesitamos
  // actualizar directamente por email (no tenemos el id en ese momento)
  // y para evitar cargar primero la entidad completa solo para actualizarla.
  // ─────────────────────────────────────────────
  async guardarResetToken(
    email: string,
    token: string | null, // null cuando se limpia tras el reset
    expiry: Date | null, // null cuando se limpia tras el reset
  ): Promise<void> {
    await this.usuariosRepository
      .createQueryBuilder() // Inicia el constructor de queries
      .update(Usuario) // UPDATE sobre la tabla usuario
      .set({ reset_token: token, reset_token_expiry: expiry } as any) // SET de los campos
      .where('email = :email', { email }) // WHERE email = ? (parámetro escapado para evitar SQL injection)
      .execute(); // Ejecuta la query
  }

  // ─────────────────────────────────────────────
  // FIND BY RESET TOKEN
  // Busca un usuario por su token de reset.
  // Usado por AuthService en resetPassword() para validar que el token existe.
  // Devuelve null si no existe — AuthService gestiona ese caso lanzando BadRequestException.
  // ─────────────────────────────────────────────
  async findByResetToken(token: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOneBy({ reset_token: token });
  }
}
