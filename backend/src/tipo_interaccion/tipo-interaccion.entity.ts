import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad que representa el tipo de una interacción (tabla `tipo_interaccion`).
 * Ejemplos de valores: "Llamada", "Reunión", "Correo electrónico".
 * Es una tabla de catálogo gestionada directamente en base de datos.
 */
@Entity('tipo_interaccion')
export class TipoInteraccion {
  /** Clave primaria autogenerada. Columna: id_tipo. */
  @PrimaryGeneratedColumn({ name: 'id_tipo' })
  id: number;

  /** Nombre descriptivo del tipo de interacción. */
  @Column()
  nombre: string;
}
