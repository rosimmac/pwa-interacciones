import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['user', 'read-only', 'admin'] })
  rol: 'user' | 'read-only' | 'admin';

  @Column({ nullable: true })
  reset_token: string;

  @Column({ nullable: true })
  reset_token_expiry: Date;
}
