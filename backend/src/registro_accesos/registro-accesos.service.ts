import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroAcceso } from './registro-acceso.entity';

@Injectable()
export class RegistroAccesosService {
  constructor(
    @InjectRepository(RegistroAcceso)
    private registroRepository: Repository<RegistroAcceso>,
  ) {}

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
