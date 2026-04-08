import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find({
      select: ['id', 'nombre', 'email', 'rol'], // nunca devolver password
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOneBy({ email });
  }

  async create(data: Partial<Usuario>): Promise<Omit<Usuario, 'password'>> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const usuario = this.usuariosRepository.create(data);
    const guardado = await this.usuariosRepository.save(usuario);
    const { password: _, ...resto } = guardado;
    return resto;
  }

  async update(
    id: number,
    data: Partial<Usuario>,
  ): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.findOne(id);

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const actualizado = this.usuariosRepository.merge(usuario, data);
    const guardado = await this.usuariosRepository.save(actualizado);

    const { password: _, ...resto } = guardado;
    return resto;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.usuariosRepository.delete(id);
  }
}
