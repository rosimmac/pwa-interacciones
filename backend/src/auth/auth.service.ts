import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroAccesosService } from '../registro_accesos/registro-accesos.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private registroAccesosService: RegistroAccesosService,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida)
      throw new UnauthorizedException('Credenciales incorrectas');

    await this.registroAccesosService.registrar(usuario.id, 'login');

    const payload = { id: usuario.id, email: usuario.email, rol: usuario.rol };
    return {
      token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async logout(usuarioId: number) {
    await this.registroAccesosService.registrar(usuarioId, 'logout');
    return { message: 'Sesión cerrada correctamente' };
  }
}
