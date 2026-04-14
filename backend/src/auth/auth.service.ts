// ─────────────────────────────────────────────────────────────────────────────
// AUTH SERVICE
// Contiene toda la lógica de negocio relacionada con autenticación:
//   - Login y logout de usuarios
//   - Recuperación de contraseña por email (forgotPassword)
//   - Restablecimiento de contraseña con token (resetPassword)
//
// Los servicios en NestJS son clases inyectables que separan la lógica
// de los controladores. El controlador solo recibe la petición HTTP y delega
// aquí — este service es quien decide qué hacer con los datos.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BadRequestException, // Excepción HTTP 400: el cliente envió datos incorrectos
  Injectable, // Decorador que marca esta clase como inyectable por NestJS
  UnauthorizedException, // Excepción HTTP 401: credenciales inválidas
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Servicio de NestJS para firmar y verificar tokens JWT
import { UsuariosService } from '../usuarios/usuarios.service'; // Para buscar y actualizar usuarios en la BD
import { RegistroAccesosService } from '../registro_accesos/registro-accesos.service'; // Para auditar login/logout
import * as bcrypt from 'bcryptjs'; // Librería para hashear y comparar contraseñas de forma segura
import * as crypto from 'crypto'; // Módulo nativo de Node.js para generar tokens aleatorios seguros
import * as nodemailer from 'nodemailer'; // Librería para enviar emails desde Node.js

// @Injectable() registra esta clase en el sistema de inyección de dependencias de NestJS.
// Esto permite que otros módulos (como AuthModule) la declaren como provider
// y NestJS se encargue de instanciarla y pasarla donde se necesite automáticamente.
@Injectable()
export class AuthService {
  // El constructor recibe las dependencias inyectadas por NestJS.
  // No usamos "new UsuariosService()" — NestJS crea y gestiona las instancias.
  // Esto se llama Inversión de Control (IoC) y facilita el testing,
  // porque en los tests podemos sustituir estas dependencias por mocks.
  constructor(
    private usuariosService: UsuariosService, // Acceso a la tabla de usuarios en la BD
    private jwtService: JwtService, // Generación y verificación de tokens JWT
    private registroAccesosService: RegistroAccesosService, // Registro de eventos de acceso (auditoría)
  ) {}

  // ─────────────────────────────────────────────
  // LOGIN
  // Recibe email y contraseña en texto plano.
  // Devuelve un token JWT y los datos públicos del usuario si las credenciales son válidas.
  // ─────────────────────────────────────────────
  async login(email: string, password: string) {
    // 1. Buscamos el usuario en la BD por su email.
    //    findByEmail devuelve el objeto usuario o null si no existe.
    const usuario = await this.usuariosService.findByEmail(email);

    // 2. Si el usuario no existe, lanzamos UnauthorizedException (HTTP 401).
    //    IMPORTANTE: usamos el mismo mensaje genérico que cuando la contraseña
    //    es incorrecta. Esto es una práctica de seguridad — si dijéramos
    //    "email no registrado", un atacante podría enumerar qué emails existen.
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    // 3. Comparamos la contraseña recibida (texto plano) con el hash almacenado en BD.
    //    bcrypt.compare() extrae el salt del hash y recalcula — nunca descifra.
    //    Si la contraseña coincide devuelve true, si no devuelve false.
    //    Nunca almacenamos ni comparamos contraseñas en texto plano.
    const passwordValida = await bcrypt.compare(password, usuario.password);

    // 4. Si la contraseña no coincide, lanzamos otro 401 con el mismo mensaje genérico.
    if (!passwordValida)
      throw new UnauthorizedException('Credenciales incorrectas');

    // 5. Login correcto — registramos el evento en registro_accesos para auditoría.
    //    Esto nos permite saber quién accedió y cuándo desde el panel de admin.
    await this.registroAccesosService.registrar(usuario.id, 'login');

    // 6. Construimos el payload del JWT: los datos que viajarán codificados dentro del token.
    //    Solo incluimos lo necesario para identificar al usuario en cada petición.
    //    NUNCA incluimos la contraseña ni datos sensibles en el payload —
    //    el payload es codificado en base64 pero no está cifrado, cualquiera puede leerlo.
    const payload = { id: usuario.id, email: usuario.email, rol: usuario.rol };

    // 7. Firmamos el token con la clave secreta configurada en JwtModule.
    //    El frontend guardará este token (localStorage o memoria) y lo enviará
    //    en cada petición protegida en el header: Authorization: Bearer <token>.
    //    El JwtAuthGuard verificará la firma del token en cada petición.
    return {
      token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol, // El rol permite al frontend controlar qué ve cada tipo de usuario
      },
    };
  }

  // ─────────────────────────────────────────────
  // LOGOUT
  // Recibe el id del usuario (extraído del token por el JwtAuthGuard).
  // Registra el evento de logout y devuelve confirmación.
  // ─────────────────────────────────────────────
  async logout(usuarioId: number) {
    // Registramos el evento de logout en la tabla registro_accesos.
    // NOTA: JWT es stateless — el servidor no puede invalidar un token activo.
    // El logout real ocurre en el frontend al eliminar el token del almacenamiento.
    // Este registro sirve únicamente para auditoría.
    await this.registroAccesosService.registrar(usuarioId, 'logout');

    return { message: 'Sesión cerrada correctamente' };
  }

  // ─────────────────────────────────────────────
  // FORGOT PASSWORD
  // Recibe un email y, si existe en la BD, genera un token de reset
  // y envía un email con el enlace para restablecer la contraseña.
  // ─────────────────────────────────────────────
  async forgotPassword(email: string) {
    // 1. Buscamos el usuario por email.
    const usuario = await this.usuariosService.findByEmail(email);

    // 2. Si no existe, devolvemos igualmente el mensaje genérico.
    //    SEGURIDAD: nunca confirmamos si un email está registrado o no,
    //    para evitar que un atacante use este endpoint para enumerar usuarios.
    if (!usuario) return { message: 'Si el email existe, recibirás un enlace' };

    // 3. Generamos un token aleatorio criptográficamente seguro (32 bytes → 64 chars hex).
    //    crypto.randomBytes() usa el generador de números aleatorios del SO,
    //    mucho más seguro que Math.random().
    const token = crypto.randomBytes(32).toString('hex');

    // 4. Calculamos la fecha de expiración: 1 hora desde ahora.
    //    Date.now() devuelve milisegundos, por eso multiplicamos 60*60*1000.
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    // 5. Guardamos el token y su expiración en la BD asociados al usuario.
    //    Así cuando llegue la petición de reset podemos validar que el token
    //    existe y no ha caducado.
    await this.usuariosService.guardarResetToken(email, token, expiry);

    console.log('Token guardado, enviando email a:', email);

    // 6. Configuramos el transporter de nodemailer con las credenciales de Gmail.
    //    Las credenciales se leen de variables de entorno (.env) para no
    //    exponerlas en el código fuente.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER, // Email de la cuenta Gmail que envía
        pass: process.env.MAIL_PASS, // Contraseña que proporciona la aplicación de Gmail (no la contraseña real)
      },
    });

    // 7. Construimos la URL de reset que incluye el token como query param.
    //    El frontend leerá este token de la URL y lo enviará al endpoint resetPassword.
    const resetUrl = `http://localhost:5173/restablecer?token=${token}`;

    // 8. Intentamos enviar el email. Usamos try/catch para que si falla el envío
    //    (ej: credenciales incorrectas, servicio caído) no rompa el flujo
    //    y el usuario reciba igualmente el mensaje genérico.
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
      // Si falla el envío lo registramos en consola pero no lanzamos excepción,
      // para no revelar información ni dejar al usuario sin respuesta.
      console.error('Error al enviar email:', error);
    }

    // 9. Devolvemos siempre el mismo mensaje, independientemente de si el usuario
    //    existía o si el email se envió correctamente.
    return { message: 'Si el email existe, recibirás un enlace' };
  }

  // ─────────────────────────────────────────────
  // RESET PASSWORD
  // Recibe el token (llegado desde el enlace del email) y la nueva contraseña.
  // Valida el token, hashea la nueva contraseña y la actualiza en BD.
  // ─────────────────────────────────────────────
  async resetPassword(token: string, newPassword: string) {
    // 1. Buscamos en la BD el usuario que tiene ese token de reset asignado.
    //    Si nadie tiene ese token, findByResetToken devuelve null.
    const usuario = await this.usuariosService.findByResetToken(token);

    // 2. Si no encontramos usuario con ese token, lo rechazamos con HTTP 400.
    //    Puede ser un token inventado, ya usado, o que nunca existió.
    if (!usuario) throw new BadRequestException('Token inválido');

    // 3. Comprobamos que el token no ha caducado.
    //    reset_token_expiry es la fecha límite que guardamos en forgotPassword.
    //    Si la fecha de expiración es anterior a ahora, el token ya no es válido.
    if (
      !usuario.reset_token_expiry ||
      usuario.reset_token_expiry < new Date()
    ) {
      throw new BadRequestException('El token ha caducado');
    }

    // 4. Hasheamos la nueva contraseña antes de guardarla.
    //    El factor de coste 10 es el estándar recomendado — equilibrio entre
    //    seguridad (más rondas = más difícil de crackear) y rendimiento.
    //    NUNCA guardamos contraseñas en texto plano.
    const hashed = await bcrypt.hash(newPassword, 10);

    // 5. Actualizamos la contraseña del usuario en la BD con el hash.
    await this.usuariosService.update(usuario.id, { password: hashed });

    // 6. Limpiamos el token de reset en la BD (lo ponemos a null).
    //    IMPORTANTE: si no lo limpiamos, el mismo enlace podría usarse
    //    varias veces para cambiar la contraseña (vulnerabilidad de reutilización).
    await this.usuariosService.guardarResetToken(usuario.email, null, null);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
