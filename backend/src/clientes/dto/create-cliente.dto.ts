import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO para la creación de un nuevo cliente.
 * Valida que el body incluya un nombre no vacío.
 * El usuarioId y la fechaCreacion se asignan en el servicio, no se aceptan del cliente.
 */
export class CreateClienteDto {
  /** Nombre del cliente. Obligatorio y no puede ser una cadena vacía. */
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
