import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

/**
 * Entidad que representa un registro de acceso al sistema (tabla `registro_accesos`).
 * Se crea un registro cada vez que un usuario inicia o cierra sesión,
 * permitiendo auditar la actividad de acceso.
 */
@Entity('registro_accesos')
export class RegistroAcceso {
  /** Clave primaria autogenerada. Columna: id_acceso. */
  @PrimaryGeneratedColumn({ name: 'id_acceso' })
  id: number;

  /** Fecha y hora exacta en que se produjo el acceso. */
  @Column({ type: 'datetime' })
  fecha: Date;

  /** Tipo de evento registrado (p.ej. 'login', 'logout'). */
  @Column()
  tipo: string;

  /** Relación Many-to-One con Usuario: un usuario puede tener múltiples registros de acceso. */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  /** Clave foránea del usuario al que pertenece este registro. Columna: id_usuario. */
  @Column({ name: 'id_usuario' })
  usuarioId: number;
}
