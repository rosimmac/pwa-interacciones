import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';

/**
 * Controlador de autenticación.
 * Gestiona el registro, login, logout y recuperación de contraseña.
 * Las rutas públicas no requieren token JWT; el logout sí lo requiere.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  /** POST /auth/login — Autentica al usuario y devuelve un token JWT. */
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  /** POST /auth/registro — Crea un nuevo usuario. Si no se indica rol, se asigna 'user' por defecto. */
  @Post('registro')
  registro(@Body() body: RegistroDto) {
    return this.usuariosService.create({ ...body, rol: body.rol ?? 'user' });
  }

  /** POST /auth/logout — Cierra la sesión del usuario autenticado. Requiere token JWT válido. */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: any) {
    return this.authService.logout(req.user.id);
  }

  /** POST /auth/forgot-password — Envía un correo con el enlace de recuperación de contraseña. */
  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  /** POST /auth/reset-password — Restablece la contraseña usando el token recibido por correo. */
  @Post('reset-password')
  resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
