import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Estrategia JWT de Passport.
 * Define cómo se extrae y valida el token en cada petición protegida.
 *
 * Cuando JwtAuthGuard intercepta una petición:
 * 1. Extrae el token del header Authorization: Bearer <token>.
 * 2. Verifica la firma con la clave secreta (JWT_SECRET).
 * 3. Comprueba que el token no ha expirado.
 * 4. Si es válido, llama a validate() y adjunta el resultado a req.user.
 *
 * El objeto devuelto por validate() es lo que estará disponible en req.user
 * dentro de los controladores que usen @Request() req.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // Extrae el token del header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: false garantiza que los tokens caducados sean rechazados
      ignoreExpiration: false,
      // Clave secreta para verificar la firma del token, leída desde .env
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'fallback_secret',
    });
  }

  /**
   * Se ejecuta tras verificar que el token es válido y no ha expirado.
   * Recibe el payload decodificado del JWT y devuelve el objeto que se
   * adjuntará a req.user en los controladores.
   * Solo incluimos los campos necesarios para las comprobaciones de acceso.
   */
  async validate(payload: any) {
    return { id: payload.id, email: payload.email, rol: payload.rol };
  }
}
