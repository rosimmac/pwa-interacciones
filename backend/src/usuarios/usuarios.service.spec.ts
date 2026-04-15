// ─────────────────────────────────────────────────────────────────────────────
// TESTS UNITARIOS — UsuariosService
//
// Testeamos la lógica de negocio del CRUD de usuarios de forma aislada.
// El repositorio de TypeORM se mockea para no depender de la BD real.
//
// Aspectos clave de este service que testeamos especialmente:
//   - La password NUNCA se devuelve en las respuestas (se elimina con destructuring)
//   - La password se hashea con bcrypt antes de persistir
//   - Los métodos auxiliares del flujo de reset de contraseña
//
// Métodos testeados: findAll, findOne, findByEmail, create, update, remove,
//                    guardarResetToken, findByResetToken
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mockeamos nodemailer para evitar intentos de envío real de email
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test' }),
  }),
}));

// ─────────────────────────────────────────────
// MOCK DEL QUERY BUILDER
// guardarResetToken() usa createQueryBuilder() para hacer un UPDATE directo.
// Necesitamos mockear toda la cadena de llamadas encadenadas que usa TypeORM:
// createQueryBuilder().update().set().where().execute()
// Cada método devuelve "this" (el propio objeto) para permitir el encadenamiento,
// excepto execute() que devuelve una promesa.
// ─────────────────────────────────────────────
const mockQueryBuilder = {
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue(undefined),
};

// ─────────────────────────────────────────────
// MOCK DEL REPOSITORIO
// findOne y findOneBy son métodos distintos — ambos necesarios:
//   - findOne: usado en findOne() público con select
//   - findOneBy: usado en findOneInterno(), findByEmail() y findByResetToken()
// ─────────────────────────────────────────────
const mockUsuariosRepository = {
  find: jest.fn(),
  findOne: jest.fn(), // usado en findOne() público — con select
  findOneBy: jest.fn(), // usado en findOneInterno(), findByEmail(), findByResetToken()
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

// ─────────────────────────────────────────────
// DATOS DE PRUEBA REUTILIZABLES
// ─────────────────────────────────────────────
const usuarioMock: Usuario = {
  id: 1,
  nombre: 'Rosa Test',
  email: 'rosa@test.com',
  password: 'hashed_password',
  rol: 'user',
  reset_token: null,
  reset_token_expiry: null,
} as unknown as Usuario;

// Usuario sin password — así es como debe devolverse en las respuestas HTTP
const usuarioSinPassword = {
  id: 1,
  nombre: 'Rosa Test',
  email: 'rosa@test.com',
  rol: 'user',
  reset_token: null,
  reset_token_expiry: null,
};

describe('UsuariosService', () => {
  let service: UsuariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuariosRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // FIND ALL
  // ─────────────────────────────────────────────
  describe('findAll', () => {
    it('debería devolver todos los usuarios', async () => {
      mockUsuariosRepository.find.mockResolvedValue([usuarioSinPassword]);

      const resultado = await service.findAll();

      expect(resultado).toEqual([usuarioSinPassword]);
    });

    it('debería llamar a find con select que excluye la password', async () => {
      mockUsuariosRepository.find.mockResolvedValue([usuarioSinPassword]);

      await service.findAll();

      expect(mockUsuariosRepository.find).toHaveBeenCalledWith({
        select: ['id', 'nombre', 'email', 'rol'],
      });
    });

    it('debería devolver array vacío si no hay usuarios', async () => {
      mockUsuariosRepository.find.mockResolvedValue([]);

      const resultado = await service.findAll();

      expect(resultado).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // FIND ONE
  // findOne() usa findOne() del repositorio con select para excluir password.
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('debería devolver el usuario si existe', async () => {
      mockUsuariosRepository.findOne.mockResolvedValue(usuarioSinPassword);

      const resultado = await service.findOne(1);

      expect(resultado).toEqual(usuarioSinPassword);
      // Verificamos que se llamó con where y select — nunca devuelve password
      expect(mockUsuariosRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id', 'nombre', 'email', 'rol'],
      });
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockUsuariosRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('el mensaje de error debe incluir el id del usuario no encontrado', async () => {
      mockUsuariosRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(
        'Usuario 99 no encontrado',
      );
    });
  });

  // ─────────────────────────────────────────────
  // FIND BY EMAIL
  // Devuelve null si no existe — no lanza excepción.
  // ─────────────────────────────────────────────
  describe('findByEmail', () => {
    it('debería devolver el usuario si el email existe', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(usuarioMock);

      const resultado = await service.findByEmail('rosa@test.com');

      expect(resultado).toEqual(usuarioMock);
      expect(mockUsuariosRepository.findOneBy).toHaveBeenCalledWith({
        email: 'rosa@test.com',
      });
    });

    it('debería devolver null si el email no existe', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(null);

      const resultado = await service.findByEmail('noexiste@test.com');

      expect(resultado).toBeNull();
    });
  });

  // ─────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────
  describe('create', () => {
    it('debería crear el usuario y devolver los datos sin password', async () => {
      mockUsuariosRepository.create.mockReturnValue(usuarioMock);
      mockUsuariosRepository.save.mockResolvedValue(usuarioMock);

      const resultado = await service.create({
        nombre: 'Rosa Test',
        email: 'rosa@test.com',
        password: 'Password1!',
        rol: 'user',
      });

      expect(resultado).not.toHaveProperty('password');
    });

    it('debería hashear la password antes de guardarla en BD', async () => {
      mockUsuariosRepository.create.mockReturnValue(usuarioMock);
      mockUsuariosRepository.save.mockResolvedValue(usuarioMock);

      await service.create({
        nombre: 'Rosa Test',
        email: 'rosa@test.com',
        password: 'Password1!',
        rol: 'user',
      });

      const llamadaCreate = mockUsuariosRepository.create.mock.calls[0][0];
      const passwordGuardada = llamadaCreate.password;

      const esHash = await bcrypt.compare('Password1!', passwordGuardada);
      expect(esHash).toBe(true);
    });

    it('debería devolver los campos correctos del usuario creado', async () => {
      mockUsuariosRepository.create.mockReturnValue(usuarioMock);
      mockUsuariosRepository.save.mockResolvedValue(usuarioMock);

      const resultado = await service.create({
        nombre: 'Rosa Test',
        email: 'rosa@test.com',
        password: 'Password1!',
        rol: 'user',
      });

      expect(resultado).toMatchObject({
        id: 1,
        nombre: 'Rosa Test',
        email: 'rosa@test.com',
        rol: 'user',
      });
    });
  });

  // ─────────────────────────────────────────────
  // UPDATE
  // update() usa findOneInterno() internamente — que llama a findOneBy().
  // ─────────────────────────────────────────────
  describe('update', () => {
    it('debería actualizar el usuario y devolver los datos sin password', async () => {
      // update() usa findOneInterno() que llama a findOneBy()
      mockUsuariosRepository.findOneBy.mockResolvedValue(usuarioMock);
      mockUsuariosRepository.merge.mockReturnValue(usuarioMock);
      mockUsuariosRepository.save.mockResolvedValue(usuarioMock);

      const resultado = await service.update(1, { nombre: 'Nuevo Nombre' });

      expect(resultado).not.toHaveProperty('password');
    });

    it('debería hashear la nueva password si se actualiza', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(usuarioMock);
      mockUsuariosRepository.merge.mockReturnValue({
        ...usuarioMock,
        password: 'NuevaPassword1!',
      });
      mockUsuariosRepository.save.mockResolvedValue(usuarioMock);

      await service.update(1, { password: 'NuevaPassword1!' });

      const llamadaMerge = mockUsuariosRepository.merge.mock.calls[0][1];
      const passwordActualizada = llamadaMerge.password;

      const esHash = await bcrypt.compare(
        'NuevaPassword1!',
        passwordActualizada,
      );
      expect(esHash).toBe(true);
    });

    it('debería lanzar NotFoundException si el usuario a actualizar no existe', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { nombre: 'Nuevo' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('no debería hashear si no se incluye password en el update', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(usuarioMock);
      mockUsuariosRepository.merge.mockReturnValue(usuarioMock);
      mockUsuariosRepository.save.mockResolvedValue(usuarioMock);

      await service.update(1, { nombre: 'Solo nombre' });

      const llamadaMerge = mockUsuariosRepository.merge.mock.calls[0][1];
      expect(llamadaMerge.password).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────
  // REMOVE
  // remove() usa findOne() público — que llama a findOne() del repositorio.
  // ─────────────────────────────────────────────
  describe('remove', () => {
    it('debería eliminar el usuario si existe', async () => {
      // remove() llama a findOne() público que usa findOne() del repositorio
      mockUsuariosRepository.findOne.mockResolvedValue(usuarioSinPassword);
      mockUsuariosRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockUsuariosRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debería lanzar NotFoundException si el usuario a eliminar no existe', async () => {
      mockUsuariosRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('no debería llamar a delete si el usuario no existe', async () => {
      mockUsuariosRepository.findOne.mockResolvedValue(null);

      try {
        await service.remove(99);
      } catch {
        // Capturamos la excepción — solo nos interesa verificar que delete() no se llamó
      }

      expect(mockUsuariosRepository.delete).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // GUARDAR RESET TOKEN
  // ─────────────────────────────────────────────
  describe('guardarResetToken', () => {
    it('debería guardar el token y la fecha de expiración', async () => {
      const expiry = new Date(Date.now() + 60 * 60 * 1000);

      await service.guardarResetToken('rosa@test.com', 'token_hex', expiry);

      expect(mockQueryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          reset_token: 'token_hex',
          reset_token_expiry: expiry,
        }),
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('email = :email', {
        email: 'rosa@test.com',
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('debería limpiar el token pasando null cuando se llama tras el reset', async () => {
      await service.guardarResetToken(
        'rosa@test.com',
        null as any,
        null as any,
      );

      expect(mockQueryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          reset_token: null,
          reset_token_expiry: null,
        }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // FIND BY RESET TOKEN
  // ─────────────────────────────────────────────
  describe('findByResetToken', () => {
    it('debería devolver el usuario si el token existe', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(usuarioMock);

      const resultado = await service.findByResetToken('token_valido');

      expect(resultado).toEqual(usuarioMock);
      expect(mockUsuariosRepository.findOneBy).toHaveBeenCalledWith({
        reset_token: 'token_valido',
      });
    });

    it('debería devolver null si el token no existe', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(null);

      const resultado = await service.findByResetToken('token_inexistente');

      expect(resultado).toBeNull();
    });
  });
});
