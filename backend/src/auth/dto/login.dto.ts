import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO para la petición de login.
 * Valida que el body contenga un email válido y una contraseña de al menos 8 caracteres.
 * ValidationPipe en main.ts rechaza la petición automáticamente si no se cumplen estas reglas.
 */
export class LoginDto {
  /** Dirección de correo electrónico del usuario. Debe tener formato email válido. */
  @IsEmail()
  email: string;

  /** Contraseña en texto plano. Mínimo 8 caracteres. Se compara con el hash almacenado en BD. */
  @IsString()
  @MinLength(8)
  password: string;
}
