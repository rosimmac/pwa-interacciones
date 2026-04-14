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

import { Test, TestingModule } from '@nestjs/testing'; // Utilidades de NestJS para montar módulos en entorno de test
import { UsuariosService } from './usuarios.service';
import { getRepositoryToken } from '@nestjs/typeorm'; // Helper que devuelve el token de inyección del repositorio
import { Usuario } from './usuario.entity';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────
// MOCK DEL QUERY BUILDER
// guardarResetToken() usa createQueryBuilder() para hacer un UPDATE directo.
// Necesitamos mockear toda la cadena de llamadas encadenadas que usa TypeORM:
// createQueryBuilder().update().set().where().execute()
// Cada método devuelve "this" (el propio objeto) para permitir el encadenamiento,
// excepto execute() que devuelve una promesa.
// ─────────────────────────────────────────────
const mockQueryBuilder = {
  update: jest.fn().mockReturnThis(), // .update() devuelve el propio queryBuilder
  set: jest.fn().mockReturnThis(), // .set() devuelve el propio queryBuilder
  where: jest.fn().mockReturnThis(), // .where() devuelve el propio queryBuilder
  execute: jest.fn().mockResolvedValue(undefined), // .execute() termina la cadena
};

// ─────────────────────────────────────────────
// MOCK DEL REPOSITORIO
// ─────────────────────────────────────────────
const mockUsuariosRepository = {
  find: jest.fn(), // Usado en findAll()
  findOneBy: jest.fn(), // Usado en findOne() y findByEmail() y findByResetToken()
  create: jest.fn(), // Usado en create() — instancia la entidad
  save: jest.fn(), // Usado en create() y update() — persiste en BD
  merge: jest.fn(), // Usado en update() — fusiona entidad con nuevos datos
  delete: jest.fn(), // Usado en remove()
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder), // Usado en guardarResetToken()
};

// ─────────────────────────────────────────────
// DATOS DE PRUEBA REUTILIZABLES
// ─────────────────────────────────────────────
const usuarioMock: Usuario = {
  id: 1,
  nombre: 'user Test',
  email: 'user@test.com',
  password: 'hashed_password', // en BD siempre está hasheada
  rol: 'user',
  reset_token: null,
  reset_token_expiry: null,
} as unknown as Usuario; // TypeScript no infiere bien el tipo al crear el objeto literal, así que forzamos el cast

// Usuario sin password — así es como debe devolverse en las respuestas
const usuarioSinPassword = {
  id: 1,
  nombre: 'user Test',
  email: 'user@test.com',
  rol: 'user',
  reset_token: null,
  reset_token_expiry: null,
};

describe('UsuariosService', () => {
  let service: UsuariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService, // El service real que queremos testear
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuariosRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);

    // Limpiamos el historial de llamadas entre tests para evitar contaminación
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // FIND ALL
  // Testeamos que devuelve todos los usuarios y que nunca incluye la password.
  // El service usa select: ['id', 'nombre', 'email', 'rol'] para excluirla desde la query.
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

      // Verificamos que el select nunca incluye 'password' — seguridad fundamental
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
  // Testeamos que devuelve el usuario correcto o lanza 404.
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('debería devolver el usuario si existe', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(usuarioMock);

      const resultado = await service.findOne(1);

      expect(resultado).toEqual(usuarioMock);
      expect(mockUsuariosRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('el mensaje de error debe incluir el id del usuario no encontrado', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(
        'Usuario 99 no encontrado',
      );
    });
  });

  // ─────────────────────────────────────────────
  // FIND BY EMAIL
  // Método auxiliar usado por AuthService para buscar usuario en el login.
  // Devuelve null si no existe — no lanza excepción.
  // ─────────────────────────────────────────────
  describe('findByEmail', () => {
    it('debería devolver el usuario si el email existe', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(usuarioMock);

      const resultado = await service.findByEmail('user@test.com');

      expect(resultado).toEqual(usuarioMock);
      expect(mockUsuariosRepository.findOneBy).toHaveBeenCalledWith({
        email: 'user@test.com',
      });
    });

    it('debería devolver null si el email no existe', async () => {
      // A diferencia de findOne(), este método devuelve null en lugar de lanzar excepción
      // porque AuthService necesita controlar qué hacer cuando el email no existe
      mockUsuariosRepository.findOneBy.mockResolvedValue(null);

      const resultado = await service.findByEmail('noexiste@test.com');

      expect(resultado).toBeNull();
    });
  });

  // ─────────────────────────────────────────────
  // CREATE
  // Testeamos que la password se hashea antes de guardar
  // y que nunca se devuelve en la respuesta.
  // ─────────────────────────────────────────────
  describe('create', () => {
    it('debería crear el usuario y devolver los datos sin password', async () => {
      mockUsuariosRepository.create.mockReturnValue(usuarioMock);
      mockUsuariosRepository.save.mockResolvedValue(usuarioMock);

      const resultado = await service.create({
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
        rol: 'user',
      });

      // La respuesta no debe incluir la password en ningún caso
      expect(resultado).not.toHaveProperty('password');
    });

    it('debería hashear la password antes de guardarla en BD', async () => {
      mockUsuariosRepository.create.mockReturnValue(usuarioMock);
      mockUsuariosRepository.save.mockResolvedValue(usuarioMock);

      await service.create({
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
        rol: 'user',
      });

      // El primer argumento de create() debe contener una password hasheada,
      // no el texto plano original
      const llamadaCreate = mockUsuariosRepository.create.mock.calls[0][0];
      const passwordGuardada = llamadaCreate.password;

      // bcrypt.compare() verifica que el hash corresponde al texto plano
      const esHash = await bcrypt.compare('Password1!', passwordGuardada);
      expect(esHash).toBe(true);
    });

    it('debería devolver los campos correctos del usuario creado', async () => {
      mockUsuariosRepository.create.mockReturnValue(usuarioMock);
      mockUsuariosRepository.save.mockResolvedValue(usuarioMock);

      const resultado = await service.create({
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
        rol: 'user',
      });

      // Verificamos que devuelve los campos esperados
      expect(resultado).toMatchObject({
        id: 1,
        nombre: 'user Test',
        email: 'user@test.com',
        rol: 'user',
      });
    });
  });

  // ─────────────────────────────────────────────
  // UPDATE
  // Testeamos que actualiza correctamente, que hashea la password si se cambia,
  // y que nunca devuelve la password en la respuesta.
  // ─────────────────────────────────────────────
  describe('update', () => {
    it('debería actualizar el usuario y devolver los datos sin password', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(usuarioMock);
      mockUsuariosRepository.merge.mockReturnValue(usuarioMock);
      mockUsuariosRepository.save.mockResolvedValue(usuarioMock);

      const resultado = await service.update(1, { nombre: 'Nuevo Nombre' });

      expect(resultado).not.toHaveProperty('password');
    });

    it('debería hashear la nueva password si se actualiza', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(usuarioMock);
      // merge() fusiona el usuario existente con los nuevos datos
      mockUsuariosRepository.merge.mockReturnValue({
        ...usuarioMock,
        password: 'NuevaPassword1!', // antes de hashear
      });
      mockUsuariosRepository.save.mockResolvedValue(usuarioMock);

      await service.update(1, { password: 'NuevaPassword1!' });

      // El argumento pasado a merge() debe contener la password ya hasheada
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

      // Si no se pasa password, el campo no debe existir en los datos de merge
      const llamadaMerge = mockUsuariosRepository.merge.mock.calls[0][1];
      expect(llamadaMerge.password).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────
  // REMOVE
  // ─────────────────────────────────────────────
  describe('remove', () => {
    it('debería eliminar el usuario si existe', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(usuarioMock);
      mockUsuariosRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockUsuariosRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debería lanzar NotFoundException si el usuario a eliminar no existe', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('no debería llamar a delete si el usuario no existe', async () => {
      mockUsuariosRepository.findOneBy.mockResolvedValue(null);

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
  // Método auxiliar del flujo de recuperación de contraseña.
  // Usa un QueryBuilder para hacer un UPDATE directo por email.
  // También se llama con null,null para limpiar el token tras el reset.
  // ─────────────────────────────────────────────
  describe('guardarResetToken', () => {
    it('debería guardar el token y la fecha de expiración', async () => {
      const expiry = new Date(Date.now() + 60 * 60 * 1000);

      await service.guardarResetToken('user@test.com', 'token_hex', expiry);

      // Verificamos que se usó el queryBuilder con los datos correctos
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          reset_token: 'token_hex',
          reset_token_expiry: expiry,
        }),
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('email = :email', {
        email: 'user@test.com',
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('debería limpiar el token pasando null cuando se llama tras el reset', async () => {
      // Tras un reset exitoso se llama con null,null para invalidar el token
      await service.guardarResetToken('user@test.com', null, null);

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
  // Método auxiliar del flujo de reset: busca el usuario por su token.
  // Devuelve null si el token no existe — AuthService gestiona ese caso.
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
