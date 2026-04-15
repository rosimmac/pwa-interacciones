import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroAcceso } from './registro-acceso.entity';

/**
 * Servicio de registro de accesos.
 * Persiste eventos de login y logout en la tabla registro_accesos para auditoría.
 * Es utilizado por AuthService cada vez que un usuario inicia o cierra sesión.
 */
@Injectable()
export class RegistroAccesosService {
  constructor(
    @InjectRepository(RegistroAcceso)
    private registroRepository: Repository<RegistroAcceso>,
  ) {}

  /**
   * Registra un evento de acceso (login o logout) para el usuario indicado.
   * Asigna automáticamente la fecha y hora actuales del servidor.
   *
   * @param usuarioId - ID del usuario que genera el evento.
   * @param tipo - Tipo de evento: 'login' al entrar, 'logout' al salir.
   * @returns La entidad RegistroAcceso persistida en BD.
   */
  registrar(
    usuarioId: number,
    tipo: 'login' | 'logout',
  ): Promise<RegistroAcceso> {
    const registro = this.registroRepository.create({
      fecha: new Date(),
      tipo,
      usuarioId,
    });
    return this.registroRepository.save(registro);
  }
}
