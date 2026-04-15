import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

/**
 * Entidad que representa un cliente en la base de datos (tabla `cliente`).
 * Cada cliente pertenece a un usuario, que es quien lo gestiona.
 */
@Entity('cliente')
export class Cliente {
  /** Clave primaria autogenerada. Columna: id_cliente. */
  @PrimaryGeneratedColumn({ name: 'id_cliente' })
  id: number;

  /** Nombre del cliente. */
  @Column()
  nombre: string;

  /** Fecha en que se registró el cliente en el sistema. Columna: fecha_creacion. */
  @Column({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  /** Relación Many-to-One con Usuario: varios clientes pueden pertenecer al mismo usuario. */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  /** Clave foránea que referencia al usuario propietario del cliente. Columna: id_usuario. */
  @Column({ name: 'id_usuario' })
  usuarioId: number;
}
