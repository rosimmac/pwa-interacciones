// ─────────────────────────────────────────────────────────────────────────────
// TESTS UNITARIOS — ClientesService
//
// Testeamos la lógica de negocio del CRUD de clientes de forma aislada.
// El repositorio de TypeORM se mockea para no depender de la BD real.
//
// Métodos testeados: findAll, findOne, create, update, remove
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing'; // Utilidades de NestJS para montar módulos en entorno de test
import { ClientesService } from './clientes.service';
import { getRepositoryToken } from '@nestjs/typeorm'; // Helper que devuelve el token de inyección del repositorio
import { Cliente } from './cliente.entity';
import { NotFoundException } from '@nestjs/common';

// ─────────────────────────────────────────────
// MOCK DEL REPOSITORIO
// TypeORM inyecta el repositorio con @InjectRepository(Cliente).
// En tests lo sustituimos por este objeto con los mismos métodos,
// todos controlados por jest.fn() para configurarlos en cada test.
// jest.fn() crea una función vacía que podemos programar con
// mockResolvedValue() (para async) o mockReturnValue() (para sync).
// ─────────────────────────────────────────────
const mockClientesRepository = {
  find: jest.fn(), // Usado en findAll() — devuelve array de clientes
  findOneBy: jest.fn(), // Usado en findOne() — devuelve un cliente o null
  create: jest.fn(), // Usado en create() — instancia la entidad (no persiste)
  save: jest.fn(), // Usado en create() — persiste la entidad en BD
  update: jest.fn(), // Usado en update() — actualiza campos en BD
  delete: jest.fn(), // Usado en remove() — elimina el registro de BD
};

// ─────────────────────────────────────────────
// DATOS DE PRUEBA REUTILIZABLES
// Simulamos un cliente tal como lo devolvería la BD.
// usuario: null porque es una relación ManyToOne que no necesitamos
// poblar en tests unitarios — solo nos interesa la lógica del service.
// Usamos "as unknown as Cliente" para que TypeScript no se queje
// al no poder asignar null a una relación tipada como Usuario.
// ─────────────────────────────────────────────
const clienteMock: Cliente = {
  id: 1,
  nombre: 'Cliente Test',
  fechaCreacion: new Date('2024-01-01'),
  usuarioId: 10,
  usuario: null, // relación ManyToOne — no necesaria en tests unitarios
} as unknown as Cliente;

describe('ClientesService', () => {
  let service: ClientesService;

  // beforeEach() se ejecuta antes de CADA test individual.
  // Montamos un módulo de testing limpio en cada test para evitar
  // que el estado de un test afecte al siguiente.
  beforeEach(async () => {
    // Test.createTestingModule() crea un módulo NestJS de prueba.
    // Declaramos el service real y sustituimos el repositorio de TypeORM
    // por nuestro mock usando getRepositoryToken(Cliente) como clave de inyección —
    // es el mismo token que usa @InjectRepository(Cliente) internamente.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService, // El service que queremos testear — este sí es real
        {
          provide: getRepositoryToken(Cliente), // Token que identifica al repositorio de Cliente
          useValue: mockClientesRepository, // Mock que NestJS inyectará en lugar del repositorio real
        },
      ],
    }).compile();

    // Obtenemos la instancia del service con el repositorio mockeado ya inyectado
    service = module.get<ClientesService>(ClientesService);

    // Limpiamos el historial de llamadas de todos los mocks antes de cada test.
    // Sin esto, las llamadas del test anterior contaminarían las comprobaciones
    // del siguiente (ej: find() aparecería como llamada 2 veces en el test 2).
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // FIND ALL
  // Testeamos que devuelve todos los clientes o filtra por usuarioId
  // según si se pasa el parámetro opcional o no.
  // ─────────────────────────────────────────────
  describe('findAll', () => {
    it('debería devolver todos los clientes si no se pasa usuarioId', async () => {
      // Configuramos el mock para que find() devuelva un array con nuestro cliente de prueba
      mockClientesRepository.find.mockResolvedValue([clienteMock]);

      const resultado = await service.findAll(); // Sin argumento → sin filtro

      expect(resultado).toEqual([clienteMock]);
      // Verificamos que find() se llamó sin ningún argumento (sin WHERE)
      expect(mockClientesRepository.find).toHaveBeenCalledWith();
    });

    it('debería filtrar clientes por usuarioId si se proporciona', async () => {
      mockClientesRepository.find.mockResolvedValue([clienteMock]);

      const resultado = await service.findAll(10); // Con usuarioId → con filtro WHERE

      expect(resultado).toEqual([clienteMock]);
      // Verificamos que find() se llamó con el filtro where correcto
      expect(mockClientesRepository.find).toHaveBeenCalledWith({
        where: { usuarioId: 10 },
      });
    });

    it('debería devolver un array vacío si no hay clientes', async () => {
      // Simulamos una BD sin clientes
      mockClientesRepository.find.mockResolvedValue([]);

      const resultado = await service.findAll();

      // El service debe devolver el array vacío tal cual, sin lanzar error
      expect(resultado).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // FIND ONE
  // Testeamos que devuelve el cliente correcto o lanza NotFoundException
  // con el mensaje adecuado si no existe.
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('debería devolver el cliente si existe', async () => {
      mockClientesRepository.findOneBy.mockResolvedValue(clienteMock);

      const resultado = await service.findOne(1);

      expect(resultado).toEqual(clienteMock);
      // Verificamos que se buscó por el id correcto
      expect(mockClientesRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('debería lanzar NotFoundException si el cliente no existe', async () => {
      // findOneBy devuelve null — el cliente no está en BD
      mockClientesRepository.findOneBy.mockResolvedValue(null);

      // rejects.toThrow() verifica que la promesa se rechaza con esa excepción (HTTP 404)
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('el mensaje de error debe incluir el id del cliente no encontrado', async () => {
      mockClientesRepository.findOneBy.mockResolvedValue(null);

      // Comprobamos que el mensaje identifica qué cliente no se encontró,
      // lo que facilita el debugging en producción
      await expect(service.findOne(99)).rejects.toThrow(
        'Cliente 99 no encontrado',
      );
    });
  });

  // ─────────────────────────────────────────────
  // CREATE
  // Testeamos que el cliente se crea correctamente,
  // que el usuarioId se asigna desde el token (no del body)
  // y que la fechaCreacion se genera en el servidor.
  // ─────────────────────────────────────────────
  describe('create', () => {
    it('debería crear y devolver el nuevo cliente', async () => {
      // create() instancia la entidad y save() la persiste — ambos mockeados
      mockClientesRepository.create.mockReturnValue(clienteMock); // mockReturnValue porque create() es síncrono
      mockClientesRepository.save.mockResolvedValue(clienteMock); // mockResolvedValue porque save() es async

      const resultado = await service.create({ nombre: 'Cliente Test' }, 10);

      expect(resultado).toEqual(clienteMock);
    });

    it('debería asignar el usuarioId al crear el cliente', async () => {
      mockClientesRepository.create.mockReturnValue(clienteMock);
      mockClientesRepository.save.mockResolvedValue(clienteMock);

      await service.create({ nombre: 'Cliente Test' }, 10);

      // objectContaining() permite verificar que el objeto incluye esas propiedades
      // sin importar si tiene más — no falla por campos extra
      expect(mockClientesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuarioId: 10 }),
      );
    });

    it('debería asignar fechaCreacion automáticamente al crear', async () => {
      mockClientesRepository.create.mockReturnValue(clienteMock);
      mockClientesRepository.save.mockResolvedValue(clienteMock);

      await service.create({ nombre: 'Cliente Test' }, 10);

      // expect.any(Date) acepta cualquier objeto Date — no podemos saber el valor exacto
      // porque se genera con new Date() en el momento de la llamada
      expect(mockClientesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ fechaCreacion: expect.any(Date) }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // UPDATE
  // Testeamos que actualiza correctamente, que lanza 404 si no existe
  // y que llama al repositorio con los argumentos correctos.
  // ─────────────────────────────────────────────
  describe('update', () => {
    it('debería actualizar y devolver el cliente modificado', async () => {
      const clienteActualizado = {
        ...clienteMock,
        nombre: 'Nombre Actualizado',
      };

      // findOneBy se llama DOS veces en update():
      // 1ª vez: dentro de findOne() para verificar que el cliente existe
      // 2ª vez: dentro de findOne() al final para devolver el cliente actualizado
      // mockResolvedValueOnce() configura cada llamada por separado en orden
      mockClientesRepository.findOneBy
        .mockResolvedValueOnce(clienteMock) // 1ª llamada: cliente existe
        .mockResolvedValueOnce(clienteActualizado); // 2ª llamada: cliente con datos nuevos
      mockClientesRepository.update.mockResolvedValue(undefined);

      const resultado = await service.update(1, {
        nombre: 'Nombre Actualizado',
      });

      expect(resultado.nombre).toBe('Nombre Actualizado');
    });

    it('debería lanzar NotFoundException si el cliente a actualizar no existe', async () => {
      // Si findOne() lanza 404, update() debe propagarlo sin llegar al repositorio
      mockClientesRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { nombre: 'Nuevo' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería llamar a update del repositorio con el id y los datos correctos', async () => {
      mockClientesRepository.findOneBy
        .mockResolvedValueOnce(clienteMock)
        .mockResolvedValueOnce(clienteMock);
      mockClientesRepository.update.mockResolvedValue(undefined);

      await service.update(1, { nombre: 'Nuevo nombre' });

      // Verificamos que el repositorio recibió exactamente el id y los datos a actualizar
      expect(mockClientesRepository.update).toHaveBeenCalledWith(1, {
        nombre: 'Nuevo nombre',
      });
    });
  });

  // ─────────────────────────────────────────────
  // REMOVE
  // Testeamos que elimina correctamente, que lanza 404 si no existe
  // y que no llega a llamar a delete() si el cliente no existe.
  // ─────────────────────────────────────────────
  describe('remove', () => {
    it('debería eliminar el cliente si existe', async () => {
      mockClientesRepository.findOneBy.mockResolvedValue(clienteMock);
      mockClientesRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      // Verificamos que delete() fue llamado con el id correcto
      expect(mockClientesRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debería lanzar NotFoundException si el cliente a eliminar no existe', async () => {
      mockClientesRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('no debería llamar a delete si el cliente no existe', async () => {
      // Si findOne() lanza excepción, la ejecución se detiene y delete() no debe llamarse.
      // Este test verifica que no se intenta eliminar algo que no existe.
      mockClientesRepository.findOneBy.mockResolvedValue(null);

      try {
        await service.remove(99);
      } catch {
        // Capturamos la excepción para que el test no falle por ella —
        // lo que nos interesa comprobar es que delete() no se ejecutó
      }

      expect(mockClientesRepository.delete).not.toHaveBeenCalled();
    });
  });
});
