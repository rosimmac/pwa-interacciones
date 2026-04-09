import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsIn,
  IsOptional,
} from 'class-validator';

export class RegistroDto {
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

  @IsOptional()
  @IsIn(['admin', 'user', 'read-only'])
  rol?: 'admin' | 'user' | 'read-only';
}
