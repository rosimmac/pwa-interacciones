import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { TipoInteraccion } from '../tipo_interaccion/tipo-interaccion.entity';
import { EstadoInteraccion } from '../estado_interaccion/estado-interaccion.entity';

/**
 * Entidad que representa una interacción con un cliente (tabla `interaccion`).
 * Cada interacción queda asociada a un cliente, al usuario que la registró,
 * un tipo (llamada, reunión, email…) y un estado (pendiente, completada…).
 */
@Entity('interaccion')
export class Interaccion {
  /** Clave primaria autogenerada. Columna: id_interaccion. */
  @PrimaryGeneratedColumn({ name: 'id_interaccion' })
  id: number;

  /** Fecha y hora en que tuvo lugar la interacción. */
  @Column({ type: 'datetime' })
  fecha: Date;

  /** Descripción detallada de la interacción. Campo opcional. */
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  /** Relación Many-to-One con Cliente: varias interacciones pueden pertenecer al mismo cliente. */
  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  /** Clave foránea del cliente asociado. Columna: id_cliente. */
  @Column({ name: 'id_cliente' })
  clienteId: number;

  /** Relación Many-to-One con Usuario: varias interacciones pueden ser registradas por el mismo usuario. */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  /** Clave foránea del usuario que registró la interacción. Columna: id_usuario. */
  @Column({ name: 'id_usuario' })
  usuarioId: number;

  /** Relación Many-to-One con TipoInteraccion (llamada, reunión, email, etc.). */
  @ManyToOne(() => TipoInteraccion)
  @JoinColumn({ name: 'id_tipo' })
  tipo: TipoInteraccion;

  /** Clave foránea del tipo de interacción. Columna: id_tipo. */
  @Column({ name: 'id_tipo' })
  tipoId: number;

  /** Relación Many-to-One con EstadoInteraccion (pendiente, completada, etc.). */
  @ManyToOne(() => EstadoInteraccion)
  @JoinColumn({ name: 'id_estado' })
  estado: EstadoInteraccion;

  /** Clave foránea del estado de la interacción. Columna: id_estado. */
  @Column({ name: 'id_estado' })
  estadoId: number;
}
