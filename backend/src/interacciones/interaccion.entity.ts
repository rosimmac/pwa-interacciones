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

@Entity('interaccion')
export class Interaccion {
  @PrimaryGeneratedColumn({ name: 'id_interaccion' })
  id: number;

  @Column({ type: 'datetime' })
  fecha: Date;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  @Column({ name: 'id_cliente' })
  clienteId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ name: 'id_usuario' })
  usuarioId: number;

  @ManyToOne(() => TipoInteraccion)
  @JoinColumn({ name: 'id_tipo' })
  tipo: TipoInteraccion;

  @Column({ name: 'id_tipo' })
  tipoId: number;

  @ManyToOne(() => EstadoInteraccion)
  @JoinColumn({ name: 'id_estado' })
  estado: EstadoInteraccion;

  @Column({ name: 'id_estado' })
  estadoId: number;
}
