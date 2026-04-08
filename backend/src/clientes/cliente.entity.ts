import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('cliente')
export class Cliente {
  @PrimaryGeneratedColumn({ name: 'id_cliente' })
  id: number;

  @Column()
  nombre: string;

  @Column({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ name: 'id_usuario' })
  usuarioId: number;
}
