import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad que representa un usuario del sistema (tabla `usuario`).
 * Los usuarios pueden tener tres roles: admin, user y read-only.
 * También almacena el token temporal para el flujo de recuperación de contraseña.
 */
@Entity('usuario')
export class Usuario {
  /** Clave primaria autogenerada. Columna: id_usuario. */
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id: number;

  /** Nombre del usuario. */
  @Column()
  nombre: string;

  /** Correo electrónico único del usuario, usado como identificador de login. */
  @Column({ unique: true })
  email: string;

  /** Contraseña almacenada con hash (bcrypt). */
  @Column()
  password: string;

  /** Rol del usuario. Determina los permisos de acceso a los recursos. */
  @Column({ type: 'enum', enum: ['user', 'read-only', 'admin'] })
  rol: 'user' | 'read-only' | 'admin';

  /** Token temporal para restablecer la contraseña. Null cuando no hay solicitud activa. */
  @Column({ nullable: true })
  reset_token: string;

  /** Fecha de expiración del token de recuperación. Null cuando no hay solicitud activa. */
  @Column({ nullable: true })
  reset_token_expiry: Date;
}
