import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroAccesosService } from '../registro_accesos/registro-accesos.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

/**
 * Servicio de autenticación.
 * Gestiona el ciclo de vida de la sesión: login, logout y recuperación de contraseña.
 */
@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private registroAccesosService: RegistroAccesosService,
  ) {}

  /**
   * Autentica al usuario y devuelve un token JWT junto con sus datos públicos.
   * Los mensajes de error son deliberadamente genéricos para evitar la enumeración
   * de usuarios registrados.
   *
   * @param email - Correo electrónico del usuario.
   * @param password - Contraseña en texto plano.
   * @returns Objeto con el token JWT y los datos públicos del usuario.
   * @throws UnauthorizedException si las credenciales son incorrectas.
   */
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

  /**
   * Registra el evento de cierre de sesión del usuario.
   * El token JWT no se invalida en servidor (stateless); el cliente debe eliminarlo localmente.
   *
   * @param usuarioId - ID del usuario que cierra sesión.
   */
  async logout(usuarioId: number) {
    await this.registroAccesosService.registrar(usuarioId, 'logout');
    return { message: 'Sesión cerrada correctamente' };
  }

  /**
   * Genera un token de recuperación y envía un correo con el enlace de restablecimiento.
   * La respuesta es siempre el mismo mensaje genérico independientemente de si el email
   * existe o no, para evitar la enumeración de cuentas registradas.
   *
   * @param email - Correo electrónico del usuario que solicita el reset.
   */
  async forgotPassword(email: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) return { message: 'Si el email existe, recibirás un enlace' };

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // Expira en 1 hora

    await this.usuariosService.guardarResetToken(email, token, expiry);

    console.log('Token guardado, enviando email a:', email);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const resetUrl = `http://localhost:5173/restablecer?token=${token}`;

    try {
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Recuperación de contraseña',
        html: `<p>Haz clic en el enlace para restablecer tu contraseña. Caduca en 1 hora.</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
      });
      console.log('Email enviado correctamente');
    } catch (error) {
      console.error('Error al enviar email:', error);
    }

    return { message: 'Si el email existe, recibirás un enlace' };
  }

  /**
   * Restablece la contraseña del usuario asociado al token proporcionado.
   * Tras el cambio, el token se invalida para impedir su reutilización.
   *
   * @param token - Token de recuperación recibido por correo.
   * @param newPassword - Nueva contraseña en texto plano.
   * @throws BadRequestException si el token no existe o ha caducado.
   */
  async resetPassword(token: string, newPassword: string) {
    const usuario = await this.usuariosService.findByResetToken(token);
    if (!usuario) throw new BadRequestException('Token inválido');

    if (
      !usuario.reset_token_expiry ||
      usuario.reset_token_expiry < new Date()
    ) {
      throw new BadRequestException('El token ha caducado');
    }

    await this.usuariosService.update(usuario.id, { password: newPassword });

    // Limpiamos el token para que el enlace no pueda reutilizarse
    await this.usuariosService.guardarResetToken(usuario.email, null, null);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
