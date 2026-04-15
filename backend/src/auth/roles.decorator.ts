import { SetMetadata } from '@nestjs/common';

/**
 * Clave de metadatos usada internamente para almacenar los roles requeridos.
 * RolesGuard la usa para leer los roles asociados a cada ruta.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador personalizado @Roles() para restringir el acceso a rutas por rol.
 * Se aplica sobre métodos o controladores junto con @UseGuards(JwtAuthGuard, RolesGuard).
 *
 * @example
 * @Roles('admin')
 * @Get()
 * findAll() { ... }
 *
 * Internamente almacena los roles como metadatos en la ruta mediante SetMetadata,
 * y RolesGuard los recupera con Reflector para validar el rol del usuario autenticado.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
