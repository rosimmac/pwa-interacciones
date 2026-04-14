// ─────────────────────────────────────────────────────────────────────────────
// TESTS UNITARIOS — InteraccionesService
//
// Testeamos la lógica de negocio del CRUD de interacciones de forma aislada.
// El repositorio de TypeORM se mockea para no depender de la BD real.
//
// Métodos testeados: findAll, findByUsuario, findOne, create, update, remove
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing'; // Utilidades de NestJS para montar módulos en entorno de test
import { InteraccionesService } from './interacciones.service';
import { getRepositoryToken } from '@nestjs/typeorm'; // Helper que devuelve el token de inyección del repositorio
import { Interaccion } from './interaccion.entity';
import { NotFoundException } from '@nestjs/common';

// ─────────────────────────────────────────────
// MOCK DEL REPOSITORIO
// Sustituimos el repositorio real de TypeORM por este objeto controlado.
// findOne aquí es el método del repositorio (recibe options con where/relations),
// distinto del findOne del service (recibe solo el id).
// ─────────────────────────────────────────────
const mockInteraccionesRepository = {
  find: jest.fn(), // Usado en findAll() y findByUsuario()
  findOne: jest.fn(), // Usado en findOne() del service — con relations
  create: jest.fn(), // Usado en create() — instancia la entidad
  save: jest.fn(), // Usado en create() — persiste en BD
  update: jest.fn(), // Usado en update()
  delete: jest.fn(), // Usado en remove()
};

// ─────────────────────────────────────────────
// DATOS DE PRUEBA REUTILIZABLES
// Simulamos una interacción tal como la devolvería la BD con sus relaciones.
// Las relaciones (cliente, usuario, tipo, estado) se ponen a null porque
// en tests unitarios no necesitamos poblarlas — solo nos interesa la lógica.
// Usamos "as unknown as Interaccion" para evitar el error de TypeScript
// al asignar null a propiedades tipadas como entidades relacionadas.
// ─────────────────────────────────────────────
const interaccionMock: Interaccion = {
  id: 1,
  fecha: new Date('2024-01-01'),
  descripcion: 'Llamada de seguimiento',
  clienteId: 1,
  usuarioId: 10,
  tipoId: 2,
  estadoId: 3,
  cliente: null, // relación ManyToOne — no necesaria en tests unitarios
  usuario: null, // relación ManyToOne — no necesaria en tests unitarios
  tipo: null, // relación ManyToOne — no necesaria en tests unitarios
  estado: null, // relación ManyToOne — no necesaria en tests unitarios
} as unknown as Interaccion;

// DTO de prueba reutilizable para create y update
const createDtoMock = {
  fecha: '2024-01-01',
  descripcion: 'Llamada de seguimiento',
  clienteId: 1,
  tipoId: 2,
  estadoId: 3,
  usuarioId: 10,
};

describe('InteraccionesService', () => {
  let service: InteraccionesService;

  // beforeEach() monta un módulo de testing limpio antes de cada test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InteraccionesService, // El service real que queremos testear
        {
          // getRepositoryToken(Interaccion) es el token que usa @InjectRepository(Interaccion)
          provide: getRepositoryToken(Interaccion),
          useValue: mockInteraccionesRepository, // Mock en lugar del repositorio real
        },
      ],
    }).compile();

    service = module.get<InteraccionesService>(InteraccionesService);

    // Limpiamos el historial de llamadas entre tests para evitar contaminación
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // FIND ALL
  // Testeamos que devuelve todas las interacciones o filtra por usuarioId,
  // y que siempre carga las relaciones necesarias para el frontend.
  // ─────────────────────────────────────────────
  describe('findAll', () => {
    it('debería devolver todas las interacciones si no se pasa usuarioId', async () => {
      mockInteraccionesRepository.find.mockResolvedValue([interaccionMock]);

      const resultado = await service.findAll();

      expect(resultado).toEqual([interaccionMock]);
      // Verificamos que se cargaron las relaciones — el frontend las necesita para mostrar nombres
      expect(mockInteraccionesRepository.find).toHaveBeenCalledWith({
        relations: ['cliente', 'usuario', 'tipo'],
      });
    });

    it('debería filtrar interacciones por usuarioId si se proporciona', async () => {
      mockInteraccionesRepository.find.mockResolvedValue([interaccionMock]);

      const resultado = await service.findAll(10);

      expect(resultado).toEqual([interaccionMock]);
      // Verificamos que se aplica el filtro WHERE y se cargan las relaciones
      expect(mockInteraccionesRepository.find).toHaveBeenCalledWith({
        relations: ['cliente', 'usuario', 'tipo'],
        where: { usuarioId: 10 },
      });
    });

    it('debería devolver un array vacío si no hay interacciones', async () => {
      mockInteraccionesRepository.find.mockResolvedValue([]);

      const resultado = await service.findAll();

      expect(resultado).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // FIND BY USUARIO
  // Método específico para obtener solo las interacciones de un usuario concreto.
  // Similar a findAll(usuarioId) pero sin el parámetro opcional.
  // ─────────────────────────────────────────────
  describe('findByUsuario', () => {
    it('debería devolver solo las interacciones del usuario indicado', async () => {
      mockInteraccionesRepository.find.mockResolvedValue([interaccionMock]);

      const resultado = await service.findByUsuario(10);

      expect(resultado).toEqual([interaccionMock]);
      // Verificamos el filtro WHERE y que se cargan las relaciones
      expect(mockInteraccionesRepository.find).toHaveBeenCalledWith({
        where: { usuarioId: 10 },
        relations: ['cliente', 'usuario', 'tipo'],
      });
    });

    it('debería devolver array vacío si el usuario no tiene interacciones', async () => {
      mockInteraccionesRepository.find.mockResolvedValue([]);

      const resultado = await service.findByUsuario(99);

      expect(resultado).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // FIND ONE
  // Testeamos que devuelve la interacción con sus relaciones
  // o lanza NotFoundException si no existe.
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('debería devolver la interacción si existe', async () => {
      mockInteraccionesRepository.findOne.mockResolvedValue(interaccionMock);

      const resultado = await service.findOne(1);

      expect(resultado).toEqual(interaccionMock);
      // Verificamos que se buscó con el id correcto y cargando las relaciones
      expect(mockInteraccionesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['cliente', 'usuario', 'tipo'],
      });
    });

    it('debería lanzar NotFoundException si la interacción no existe', async () => {
      // findOne del repositorio devuelve null — la interacción no está en BD
      mockInteraccionesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('el mensaje de error debe incluir el id de la interacción no encontrada', async () => {
      mockInteraccionesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(
        'Interaccion 99 no encontrada',
      );
    });
  });

  // ─────────────────────────────────────────────
  // CREATE
  // Testeamos que la interacción se crea correctamente y que
  // la fecha se convierte de string (DTO) a objeto Date antes de persistir.
  // ─────────────────────────────────────────────
  describe('create', () => {
    it('debería crear y devolver la nueva interacción con sus relaciones', async () => {
      mockInteraccionesRepository.create.mockReturnValue(interaccionMock);
      mockInteraccionesRepository.save.mockResolvedValue(interaccionMock);
      // findOne se llama al final de create() para devolver la interacción con relaciones
      mockInteraccionesRepository.findOne.mockResolvedValue(interaccionMock);

      const resultado = await service.create(createDtoMock);

      expect(resultado).toEqual(interaccionMock);
    });

    it('debería convertir la fecha de string a Date antes de persistir', async () => {
      mockInteraccionesRepository.create.mockReturnValue(interaccionMock);
      mockInteraccionesRepository.save.mockResolvedValue(interaccionMock);
      mockInteraccionesRepository.findOne.mockResolvedValue(interaccionMock);

      await service.create(createDtoMock);

      // El DTO llega con fecha como string ('2024-01-01') pero el service
      // la convierte a Date antes de pasarla al repositorio
      expect(mockInteraccionesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ fecha: expect.any(Date) }),
      );
    });

    it('debería llamar a findOne tras guardar para devolver las relaciones cargadas', async () => {
      mockInteraccionesRepository.create.mockReturnValue(interaccionMock);
      mockInteraccionesRepository.save.mockResolvedValue(interaccionMock);
      mockInteraccionesRepository.findOne.mockResolvedValue(interaccionMock);

      await service.create(createDtoMock);

      // Verificamos que tras el save se hace un findOne para cargar las relaciones
      // (cliente, usuario, tipo) que el frontend necesita mostrar
      expect(mockInteraccionesRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: interaccionMock.id } }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // UPDATE
  // Testeamos que actualiza correctamente, que lanza 404 si no existe,
  // que la fecha se convierte si se proporciona, y que devuelve
  // la interacción actualizada con sus relaciones.
  // ─────────────────────────────────────────────
  describe('update', () => {
    it('debería actualizar y devolver la interacción modificada', async () => {
      const interaccionActualizada = {
        ...interaccionMock,
        descripcion: 'Descripción actualizada',
      };
      // findOne se llama DOS veces: antes de actualizar y después para devolver el resultado
      mockInteraccionesRepository.findOne
        .mockResolvedValueOnce(interaccionMock) // 1ª llamada: verificar que existe
        .mockResolvedValueOnce(interaccionActualizada); // 2ª llamada: devolver actualizada
      mockInteraccionesRepository.update.mockResolvedValue(undefined);

      const resultado = await service.update(1, {
        descripcion: 'Descripción actualizada',
      });

      expect(resultado.descripcion).toBe('Descripción actualizada');
    });

    it('debería lanzar NotFoundException si la interacción a actualizar no existe', async () => {
      mockInteraccionesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(99, { descripcion: 'Nueva descripción' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería convertir la fecha a Date si se incluye en el update', async () => {
      mockInteraccionesRepository.findOne
        .mockResolvedValueOnce(interaccionMock)
        .mockResolvedValueOnce(interaccionMock);
      mockInteraccionesRepository.update.mockResolvedValue(undefined);

      await service.update(1, { fecha: '2024-06-15' });

      // Verificamos que la fecha se convirtió a Date antes de actualizar en BD
      expect(mockInteraccionesRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ fecha: expect.any(Date) }),
      );
    });

    it('no debería incluir fecha en el update si no se proporciona', async () => {
      mockInteraccionesRepository.findOne
        .mockResolvedValueOnce(interaccionMock)
        .mockResolvedValueOnce(interaccionMock);
      mockInteraccionesRepository.update.mockResolvedValue(undefined);

      await service.update(1, { descripcion: 'Solo descripción' });

      // Si no se pasa fecha, el campo fecha debe ser undefined — no se sobreescribe
      expect(mockInteraccionesRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ fecha: undefined }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // REMOVE
  // Testeamos que elimina correctamente, que lanza 404 si no existe
  // y que no llama a delete() si la interacción no existe.
  // ─────────────────────────────────────────────
  describe('remove', () => {
    it('debería eliminar la interacción si existe', async () => {
      mockInteraccionesRepository.findOne.mockResolvedValue(interaccionMock);
      mockInteraccionesRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockInteraccionesRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debería lanzar NotFoundException si la interacción a eliminar no existe', async () => {
      mockInteraccionesRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('no debería llamar a delete si la interacción no existe', async () => {
      // Si findOne lanza excepción, la ejecución se detiene y delete() no debe ejecutarse
      mockInteraccionesRepository.findOne.mockResolvedValue(null);

      try {
        await service.remove(99);
      } catch {
        // Capturamos la excepción para que el test no falle por ella —
        // lo que nos interesa es verificar que delete() no fue llamado
      }

      expect(mockInteraccionesRepository.delete).not.toHaveBeenCalled();
    });
  });
});
