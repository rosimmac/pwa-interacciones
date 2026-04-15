// ─────────────────────────────────────────────────────────────────────────────
// TESTS E2E — Interacciones
//
// Rutas testeadas:
//   GET    /api/interacciones
//   GET    /api/interacciones/:id
//   POST   /api/interacciones
//   PATCH  /api/interacciones/:id
//   DELETE /api/interacciones/:id
//
// Todas las rutas están protegidas con JWT.
// Las tablas tipo_interaccion y estado_interaccion tienen datos fijos en BD:
//   tipoId: 1 (Consulta), 2 (Reunion), 3 (Antecedente)
//   estadoId: 1 (Creada), 2 (Editada), 3 (Eliminada)
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Interacciones E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  // Tokens y ids que reutilizamos entre tests
  let tokenAdmin: string;
  let tokenUser: string;
  let tokenUser2: string;
  let clienteId: number; // id del cliente de prueba asociado a las interacciones
  let usuarioId: number; // id del usuario normal

  // ─────────────────────────────────────────────
  // DTO base reutilizable para crear interacciones
  // Usamos tipoId=1 (Consulta) y estadoId=1 (Creada) que sabemos que existen en BD
  // ─────────────────────────────────────────────
  const interaccionBase = () => ({
    fecha: '2024-01-01',
    descripcion: 'Llamada de seguimiento',
    clienteId,
    tipoId: 1,
    estadoId: 1,
    usuarioId,
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    dataSource = app.get(DataSource);
  });

  // ─────────────────────────────────────────────
  // LIMPIEZA Y DATOS DE PRUEBA
  // Creamos usuarios, obtenemos tokens, y creamos un cliente
  // que usaremos como FK en las interacciones.
  // ─────────────────────────────────────────────
  beforeEach(async () => {
    await dataSource.query('DELETE FROM registro_accesos');
    await dataSource.query('DELETE FROM interaccion');
    await dataSource.query('DELETE FROM cliente');
    await dataSource.query('DELETE FROM usuario');

    // Admin
    await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({
        nombre: 'Admin Test',
        email: 'admin@test.com',
        password: 'Password1!',
        rol: 'admin',
      });

    const loginAdmin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Password1!' });
    tokenAdmin = loginAdmin.body.token;

    // User normal
    await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({
        nombre: 'User Test',
        email: 'user@test.com',
        password: 'Password1!',
      });

    const loginUser = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'Password1!' });
    tokenUser = loginUser.body.token;
    usuarioId = loginUser.body.usuario.id; // guardamos el id para usarlo en el DTO

    // User2
    await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({
        nombre: 'User2 Test',
        email: 'user2@test.com',
        password: 'Password1!',
      });

    const loginUser2 = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'user2@test.com', password: 'Password1!' });
    tokenUser2 = loginUser2.body.token;

    // Creamos un cliente de prueba asociado al user normal
    const cliente = await request(app.getHttpServer())
      .post('/api/clientes')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ nombre: 'Cliente Test' });
    clienteId = cliente.body.id; // guardamos el id para usarlo en las interacciones
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────
  // GET /api/interacciones
  // ─────────────────────────────────────────────
  describe('GET /api/interacciones', () => {
    it('debería devolver 401 si no se envía token', async () => {
      const respuesta = await request(app.getHttpServer()).get(
        '/api/interacciones',
      );

      expect(respuesta.status).toBe(401);
    });

    it('el admin debería ver todas las interacciones', async () => {
      // User crea una interacción
      await request(app.getHttpServer())
        .post('/api/interacciones')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(interaccionBase());

      // Admin debe verla
      const respuesta = await request(app.getHttpServer())
        .get('/api/interacciones')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.length).toBeGreaterThanOrEqual(1);
    });

    it('un user solo debería ver sus propias interacciones', async () => {
      // User crea una interacción con su usuarioId
      await request(app.getHttpServer())
        .post('/api/interacciones')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(interaccionBase());

      // User2 no tiene interacciones — debe ver array vacío
      const respuesta = await request(app.getHttpServer())
        .get('/api/interacciones')
        .set('Authorization', `Bearer ${tokenUser2}`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual([]);
    });

    it('debería devolver array vacío si el usuario no tiene interacciones', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/api/interacciones')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // GET /api/interacciones/:id
  // ─────────────────────────────────────────────
  describe('GET /api/interacciones/:id', () => {
    it('debería devolver la interacción si existe', async () => {
      const creada = await request(app.getHttpServer())
        .post('/api/interacciones')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(interaccionBase());

      const respuesta = await request(app.getHttpServer())
        .get(`/api/interacciones/${creada.body.id}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toHaveProperty('id', creada.body.id);
    });

    it('debería devolver 404 si la interacción no existe', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/api/interacciones/99999')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(respuesta.status).toBe(404);
    });

    it('debería devolver 401 si no se envía token', async () => {
      const respuesta = await request(app.getHttpServer()).get(
        '/api/interacciones/1',
      );

      expect(respuesta.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // POST /api/interacciones
  // ─────────────────────────────────────────────
  describe('POST /api/interacciones', () => {
    it('debería crear una interacción y devolverla con sus relaciones', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/interacciones')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(interaccionBase());

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toHaveProperty('id');
      expect(respuesta.body).toHaveProperty(
        'descripcion',
        'Llamada de seguimiento',
      );
      // Las relaciones deben estar cargadas
      expect(respuesta.body).toHaveProperty('cliente');
      expect(respuesta.body).toHaveProperty('tipo');
    });

    it('debería devolver 400 si la fecha no tiene formato ISO válido', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/interacciones')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ ...interaccionBase(), fecha: 'no-es-fecha' });

      expect(respuesta.status).toBe(400);
    });

    it('debería devolver 400 si faltan campos obligatorios', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/interacciones')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ fecha: '2024-01-01' }); // sin clienteId, tipoId, estadoId, usuarioId

      expect(respuesta.status).toBe(400);
    });

    it('debería crear la interacción sin descripcion (es opcional)', async () => {
      const { descripcion, ...sinDescripcion } = interaccionBase();

      const respuesta = await request(app.getHttpServer())
        .post('/api/interacciones')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(sinDescripcion);

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toHaveProperty('id');
    });

    it('debería devolver 401 si no se envía token', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/interacciones')
        .send(interaccionBase());

      expect(respuesta.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // PATCH /api/interacciones/:id
  // ─────────────────────────────────────────────
  describe('PATCH /api/interacciones/:id', () => {
    it('debería actualizar la descripción de la interacción', async () => {
      const creada = await request(app.getHttpServer())
        .post('/api/interacciones')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(interaccionBase());

      const respuesta = await request(app.getHttpServer())
        .patch(`/api/interacciones/${creada.body.id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ descripcion: 'Descripción actualizada' });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toHaveProperty(
        'descripcion',
        'Descripción actualizada',
      );
    });

    it('debería devolver 404 si la interacción no existe', async () => {
      const respuesta = await request(app.getHttpServer())
        .patch('/api/interacciones/99999')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ descripcion: 'Nueva descripción' });

      expect(respuesta.status).toBe(404);
    });

    it('debería devolver 401 si no se envía token', async () => {
      const respuesta = await request(app.getHttpServer())
        .patch('/api/interacciones/1')
        .send({ descripcion: 'Nueva descripción' });

      expect(respuesta.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /api/interacciones/:id
  // ─────────────────────────────────────────────
  describe('DELETE /api/interacciones/:id', () => {
    it('debería eliminar la interacción correctamente', async () => {
      const creada = await request(app.getHttpServer())
        .post('/api/interacciones')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(interaccionBase());

      const respuesta = await request(app.getHttpServer())
        .delete(`/api/interacciones/${creada.body.id}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(respuesta.status).toBe(200);

      // Verificamos que ya no existe
      const busqueda = await request(app.getHttpServer())
        .get(`/api/interacciones/${creada.body.id}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(busqueda.status).toBe(404);
    });

    it('debería devolver 404 si la interacción no existe', async () => {
      const respuesta = await request(app.getHttpServer())
        .delete('/api/interacciones/99999')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(respuesta.status).toBe(404);
    });

    it('debería devolver 401 si no se envía token', async () => {
      const respuesta = await request(app.getHttpServer()).delete(
        '/api/interacciones/1',
      );

      expect(respuesta.status).toBe(401);
    });
  });
});
