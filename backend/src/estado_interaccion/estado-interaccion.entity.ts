import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad que representa el estado de una interacción (tabla `estado_interaccion`).
 * Ejemplos de valores: "Pendiente", "Completada", "Cancelada".
 * Es una tabla de catálogo gestionada directamente en base de datos.
 */
@Entity('estado_interaccion')
export class EstadoInteraccion {
  /** Clave primaria autogenerada. Columna: id_estado. */
  @PrimaryGeneratedColumn({ name: 'id_estado' })
  id: number;

  /** Nombre descriptivo del estado. */
  @Column()
  nombre: string;
}
