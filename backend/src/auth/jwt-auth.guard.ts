import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de autenticación JWT.
 * Extiende el AuthGuard de Passport con la estrategia 'jwt' (definida en JwtStrategy).
 * Al aplicar @UseGuards(JwtAuthGuard) en un controlador o método, NestJS extrae
 * automáticamente el token del header Authorization: Bearer <token>, lo verifica
 * con la clave secreta y, si es válido, adjunta el payload decodificado a req.user.
 * Si el token falta o es inválido devuelve HTTP 401 Unauthorized.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
