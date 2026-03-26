import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_interaccion')
export class TipoInteraccion {
  @PrimaryGeneratedColumn({ name: 'id_tipo' })
  id: number;

  @Column()
  nombre: string;
}
