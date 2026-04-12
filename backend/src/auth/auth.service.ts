// Servicio de autenticación: contiene la lógica de negocio para login y logout.
// Los servicios en NestJS son clases inyectables que separan la lógica
// de los controladores, que solo gestionan las peticiones HTTP.

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Servicio de NestJS para firmar y verificar tokens JWT
import { UsuariosService } from '../usuarios/usuarios.service'; // Para buscar usuarios en la BD
import { RegistroAccesosService } from '../registro_accesos/registro-accesos.service'; // Para registrar eventos de login/logout
import * as bcrypt from 'bcryptjs'; // Librería para comparar contraseñas con su hash

import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

// @Injectable() marca esta clase como un proveedor de NestJS,
// lo que permite que el sistema de inyección de dependencias
// la instancie y la comparta automáticamente donde se necesite.
@Injectable()
export class AuthService {
  // El constructor declara las dependencias que NestJS inyectará automáticamente.
  // No necesitamos instanciarlas con "new" — NestJS las proporciona.
  constructor(
    private usuariosService: UsuariosService, // Acceso a la tabla de usuarios
    private jwtService: JwtService, // Generación del token JWT
    private registroAccesosService: RegistroAccesosService, // Auditoría de accesos
  ) {}

  // Método de login: recibe email y contraseña en texto plano
  // y devuelve un token JWT junto con los datos públicos del usuario.
  async login(email: string, password: string) {
    // 1. Buscamos el usuario por email en la base de datos.
    //    findByEmail devuelve null si no existe.
    const usuario = await this.usuariosService.findByEmail(email);

    // 2. Si no existe el usuario, lanzamos UnauthorizedException (HTTP 401).
    //    Usamos el mismo mensaje genérico que cuando la contraseña es incorrecta
    //    para no revelar si el email está registrado o no (seguridad).
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    // 3. Comparamos la contraseña recibida con el hash almacenado en la BD.
    //    bcrypt.compare() extrae el salt del propio hash y lo usa para
    //    verificar si la contraseña coincide, sin necesidad de descifrar nada.
    //    Devuelve true si coinciden, false si no.
    const passwordValida = await bcrypt.compare(password, usuario.password);

    // 4. Si la contraseña no es válida, lanzamos otro 401.
    if (!passwordValida)
      throw new UnauthorizedException('Credenciales incorrectas');

    // 5. Registramos el evento de login en la tabla registro_accesos
    //    para tener auditoría de quién accede y cuándo.
    await this.registroAccesosService.registrar(usuario.id, 'login');

    // 6. Definimos el payload del token JWT: los datos que irán
    //    codificados dentro del token. No incluimos la contraseña
    //    ni datos sensibles, solo lo necesario para identificar al usuario.
    const payload = { id: usuario.id, email: usuario.email, rol: usuario.rol };

    // 7. Firmamos el token con jwtService.sign() y devolvemos la respuesta.
    //    El frontend almacenará este token y lo enviará en cada petición
    //    protegida mediante el header Authorization: Bearer <token>.
    return {
      token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol, // El rol permite al frontend mostrar/ocultar funcionalidades
      },
    };
  }

  // Método de logout: recibe el id del usuario extraído del token JWT
  // por el guard, registra el evento y devuelve confirmación.
  // No invalida el token en el servidor (JWT es stateless por diseño),
  // pero queda registrado en el log de accesos.
  async logout(usuarioId: number) {
    // Registramos el evento de logout en la tabla registro_accesos.
    await this.registroAccesosService.registrar(usuarioId, 'logout');

    return { message: 'Sesión cerrada correctamente' };
  }

  async forgotPassword(email: string) {
    const usuario = await this.usuariosService.findByEmail(email);

    if (!usuario) return { message: 'Si el email existe, recibirás un enlace' };

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.usuariosService.guardarResetToken(email, token, expiry);

    console.log('Token guardado, enviando email a:', email);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
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
  async resetPassword(token: string, newPassword: string) {
    const usuario = await this.usuariosService.findByResetToken(token);

    if (!usuario) throw new BadRequestException('Token inválido');

    if (
      !usuario.reset_token_expiry ||
      usuario.reset_token_expiry < new Date()
    ) {
      throw new BadRequestException('El token ha caducado');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.usuariosService.update(usuario.id, { password: hashed });

    // Limpiamos el token para que no se pueda reutilizar
    await this.usuariosService.guardarResetToken(usuario.email, null, null);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
