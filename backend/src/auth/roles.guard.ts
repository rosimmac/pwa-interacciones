import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * Guard de autorización por roles.
 * Se usa junto con JwtAuthGuard: primero se verifica el token y después este guard
 * comprueba si el rol del usuario autenticado está entre los roles requeridos por la ruta.
 *
 * Uso: aplicar @Roles('admin') en el método o controlador, y registrar este guard
 * con @UseGuards(JwtAuthGuard, RolesGuard).
 *
 * Si la ruta no tiene @Roles(), el guard permite el acceso a cualquier usuario autenticado.
 * Si el usuario no tiene el rol requerido devuelve HTTP 403 Forbidden.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Leemos los roles requeridos definidos con @Roles() en el método o la clase.
    // getAllAndOverride() prioriza el decorador del método sobre el de la clase.
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta no tiene @Roles(), cualquiera autenticado puede acceder
    if (!rolesRequeridos) return true;

    // Extraemos el usuario del request (ya lo puso JwtAuthGuard en req.user)
    const { user } = context.switchToHttp().getRequest();

    // Comprobamos si el rol del usuario está entre los roles permitidos
    return rolesRequeridos.includes(user?.rol);
  }
}
