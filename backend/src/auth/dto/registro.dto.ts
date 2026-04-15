import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsIn,
  IsOptional,
} from 'class-validator';

/**
 * DTO para la petición de registro de un nuevo usuario.
 * Aplica validaciones de formato y seguridad de contraseña antes de llegar al servicio.
 * Si no se indica rol, el controlador asigna 'user' por defecto.
 */
export class RegistroDto {
  /** Nombre completo del usuario. */
  @IsString()
  nombre: string;

  /** Correo electrónico único del usuario. Se usará como identificador de login. */
  @IsEmail()
  email: string;

  /**
   * Contraseña en texto plano. Requisitos mínimos de seguridad:
   * - Al menos 8 caracteres.
   * - Al menos una letra mayúscula.
   * - Al menos un carácter especial (!@#$%^&*...).
   * El servicio la hasheará con bcrypt antes de persistirla en BD.
   */
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message:
      'La contraseña debe tener al menos una mayúscula y un carácter especial',
  })
  password: string;

  /** Rol del usuario. Opcional — si se omite el controlador asigna 'user'. */
  @IsOptional()
  @IsIn(['admin', 'user', 'read-only'])
  rol?: 'admin' | 'user' | 'read-only';
}
