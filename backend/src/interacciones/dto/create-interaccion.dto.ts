import { IsDateString, IsOptional, IsString, IsNumber } from 'class-validator';

/**
 * DTO para la creación de una nueva interacción.
 * Valida que todos los campos obligatorios estén presentes y tengan el tipo correcto.
 * La fecha se recibe como string ISO 8601 y el servicio la convierte a Date antes de persistir.
 */
export class CreateInteraccionDto {
  /** Fecha y hora de la interacción en formato ISO 8601 (ej: "2024-06-15T10:30:00"). */
  @IsDateString()
  fecha: string;

  /** Descripción opcional de la interacción. Puede omitirse en el body. */
  @IsOptional()
  @IsString()
  descripcion?: string;

  /** ID del cliente al que pertenece esta interacción (FK → tabla cliente). */
  @IsNumber()
  clienteId: number;

  /** ID del tipo de interacción (FK → tabla tipo_interaccion). */
  @IsNumber()
  tipoId: number;

  /** ID del estado de la interacción (FK → tabla estado_interaccion). */
  @IsNumber()
  estadoId: number;

  /** ID del usuario que registra la interacción (FK → tabla usuario). */
  @IsNumber()
  usuarioId: number;
}
