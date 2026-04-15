import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create.usuario.dto';

/**
 * Servicio de usuarios.
 * Gestiona el CRUD de usuarios garantizando que la contraseña nunca se exponga
 * en las respuestas y que siempre se almacene hasheada con bcrypt.
 */
@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  /**
   * Devuelve todos los usuarios excluyendo campos sensibles (password, tokens de reset).
   */
  findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find({
      select: ['id', 'nombre', 'email', 'rol'],
    });
  }

  /**
   * Devuelve un usuario por su clave primaria SIN campos sensibles.
   * Usado por el controller para respuestas HTTP — nunca expone la password.
   *
   * @param id - ID del usuario.
   * @throws NotFoundException si el usuario no existe.
   */
  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      select: ['id', 'nombre', 'email', 'rol'],
    });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  /**
   * Uso INTERNO — devuelve el usuario completo incluyendo password y tokens.
   * Necesario para operaciones como update() que requieren todos los campos
   * para hacer el merge() de TypeORM correctamente.
   * No debe usarse nunca en respuestas HTTP.
   *
   * @param id - ID del usuario.
   * @throws NotFoundException si el usuario no existe.
   */
  private async findOneInterno(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  /**
   * Busca un usuario por su correo electrónico.
   * Devuelve null si no existe (en lugar de lanzar excepción) para que
   * AuthService pueda gestionar el caso sin revelar si el email está registrado.
   *
   * @param email - Correo electrónico a buscar.
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOneBy({ email });
  }

  /**
   * Crea un nuevo usuario hasheando su contraseña antes de persistir.
   * Devuelve el usuario creado sin la contraseña.
   *
   * @param data - Datos validados del nuevo usuario.
   * @returns Usuario creado sin el campo password.
   */
  async create(data: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const usuario = this.usuariosRepository.create(data);
    const guardado = await this.usuariosRepository.save(usuario);
    const { password: _, ...resto } = guardado;
    return resto;
  }

  /**
   * Actualiza los datos de un usuario existente.
   * Usa findOneInterno() para obtener todos los campos necesarios para el merge.
   * Si se incluye una nueva contraseña, se hashea antes de persistir.
   * Devuelve el usuario actualizado sin la contraseña.
   *
   * @param id - ID del usuario a actualizar.
   * @param data - Campos a modificar (parciales).
   * @throws NotFoundException si el usuario no existe.
   * @returns Usuario actualizado sin el campo password.
   */
  async update(
    id: number,
    data: Partial<CreateUsuarioDto>,
  ): Promise<Omit<Usuario, 'password'>> {
    // Usamos findOneInterno() porque merge() necesita la entidad completa
    const usuario = await this.findOneInterno(id);
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const actualizado = this.usuariosRepository.merge(usuario, data);
    const guardado = await this.usuariosRepository.save(actualizado);
    const { password: _, ...resto } = guardado;
    return resto;
  }

  /**
   * Elimina un usuario por su clave primaria.
   *
   * @param id - ID del usuario a eliminar.
   * @throws NotFoundException si el usuario no existe.
   */
  async remove(id: number): Promise<void> {
    // findOne() es suficiente aquí — solo necesitamos verificar que existe
    await this.findOne(id);
    await this.usuariosRepository.delete(id);
  }

  /**
   * Guarda o limpia el token de recuperación de contraseña de un usuario.
   * Se llama con un token y fecha al iniciar el flujo de reset, y con null, null
   * tras completarlo para invalidar el token y evitar su reutilización.
   *
   * @param email - Correo electrónico del usuario.
   * @param token - Token de recuperación, o null para limpiarlo.
   * @param expiry - Fecha de expiración del token, o null para limpiarlo.
   */
  async guardarResetToken(
    email: string,
    token: string | null,
    expiry: Date | null,
  ): Promise<void> {
    await this.usuariosRepository
      .createQueryBuilder()
      .update(Usuario)
      .set({ reset_token: token, reset_token_expiry: expiry } as any)
      .where('email = :email', { email })
      .execute();
  }

  /**
   * Busca un usuario por su token de recuperación de contraseña.
   * Devuelve null si no existe ningún usuario con ese token.
   *
   * @param token - Token de recuperación a buscar.
   */
  async findByResetToken(token: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOneBy({ reset_token: token });
  }
}
