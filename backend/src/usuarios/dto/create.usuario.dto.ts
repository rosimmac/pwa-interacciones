import { IsEmail, IsString, IsIn, MinLength, Matches } from 'class-validator';

/**
 * DTO para la creación de un usuario por parte del administrador.
 * A diferencia de RegistroDto, el rol es obligatorio y no tiene valor por defecto.
 * La contraseña debe cumplir los mismos requisitos de seguridad que en el registro.
 */
export class CreateUsuarioDto {
  /** Nombre completo del usuario. */
  @IsString()
  nombre: string;

  /** Correo electrónico único. Se usará como identificador de login. */
  @IsEmail()
  email: string;

  /**
   * Contraseña en texto plano. Requisitos mínimos:
   * - Al menos 8 caracteres.
   * - Al menos una letra mayúscula.
   * - Al menos un carácter especial.
   * El servicio la hasheará con bcrypt antes de persistirla.
   */
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message:
      'La contraseña debe tener al menos una mayúscula y un carácter especial',
  })
  password: string;

  /** Rol del usuario. Determina los permisos de acceso. Campo obligatorio. */
  @IsIn(['admin', 'user', 'read-only'])
  rol: 'admin' | 'user' | 'read-only';
}
