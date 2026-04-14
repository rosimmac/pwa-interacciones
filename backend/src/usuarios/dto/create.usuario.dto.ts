import { IsEmail, IsString, IsIn, MinLength, Matches } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message:
      'La contraseña debe tener al menos una mayúscula y un carácter especial',
  })
  password: string;

  @IsIn(['admin', 'user', 'read-only'])
  rol: 'admin' | 'user' | 'read-only';
}
