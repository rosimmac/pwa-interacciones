import { IsDateString, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateInteraccionDto {
  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  clienteId: number;

  @IsNumber()
  tipoId: number;

  @IsNumber()
  estadoId: number;

  @IsNumber()
  usuarioId: number;
}
