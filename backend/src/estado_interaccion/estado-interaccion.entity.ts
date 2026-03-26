import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('estado_interaccion')
export class EstadoInteraccion {
  @PrimaryGeneratedColumn({ name: 'id_estado' })
  id: number;

  @Column()
  nombre: string;
}
