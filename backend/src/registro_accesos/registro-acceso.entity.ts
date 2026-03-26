import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('registro_accesos')
export class RegistroAcceso {
  @PrimaryGeneratedColumn({ name: 'id_acceso' })
  id: number;

  @Column({ type: 'datetime' })
  fecha: Date;

  @Column()
  tipo: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ name: 'id_usuario' })
  usuarioId: number;
}
