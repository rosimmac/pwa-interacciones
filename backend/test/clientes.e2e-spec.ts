// ─────────────────────────────────────────────────────────────────────────────
// TESTS E2E — Clientes
//
// Rutas testeadas:
//   GET    /api/clientes
//   GET    /api/clientes/:id
//   POST   /api/clientes
//   PATCH  /api/clientes/:id
//   DELETE /api/clientes/:id
//
// Todas las rutas están protegidas con JWT.
// Testeamos también el comportamiento por roles:
//   - admin: ve todos los clientes
//   - user: solo ve los suyos
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Clientes E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  // Tokens JWT que obtenemos en el setup y reutilizamos en los tests
  let tokenAdmin: string;
  let tokenUser: string;
  let tokenUser2: string;

  // ─────────────────────────────────────────────
  // SETUP
  // ─────────────────────────────────────────────
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
  // Antes de cada test limpiamos las tablas y creamos
  // usuarios de prueba con distintos roles para testear
  // el comportamiento por rol.
  // ─────────────────────────────────────────────
  beforeEach(async () => {
    // Limpiamos en orden respetando foreign keys
    await dataSource.query('DELETE FROM registro_accesos');
    await dataSource.query('DELETE FROM interaccion');
    await dataSource.query('DELETE FROM cliente');
    await dataSource.query('DELETE FROM usuario');

    // Creamos usuario admin y obtenemos su token
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

    // Creamos usuario normal y obtenemos su token
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

    // Creamos un segundo usuario para testear aislamiento de datos
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
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────
  // GET /api/clientes
  // ─────────────────────────────────────────────
  describe('GET /api/clientes', () => {
    it('debería devolver 401 si no se envía token', async () => {
      const respuesta = await request(app.getHttpServer()).get('/api/clientes');

      expect(respuesta.status).toBe(401);
    });

    it('el admin debería ver todos los clientes', async () => {
      // User crea un cliente y User2 crea otro
      await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ nombre: 'Cliente de User' });

      await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({ nombre: 'Cliente de User2' });

      // Admin debe ver los dos
      const respuesta = await request(app.getHttpServer())
        .get('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toHaveLength(2);
    });

    it('un user solo debería ver sus propios clientes', async () => {
      // User crea un cliente y User2 crea otro
      await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ nombre: 'Cliente de User' });

      await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({ nombre: 'Cliente de User2' });

      // User solo debe ver el suyo
      const respuesta = await request(app.getHttpServer())
        .get('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toHaveLength(1);
      expect(respuesta.body[0].nombre).toBe('Cliente de User');
    });

    it('debería devolver array vacío si el usuario no tiene clientes', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // GET /api/clientes/:id
  // ─────────────────────────────────────────────
  describe('GET /api/clientes/:id', () => {
    it('debería devolver el cliente si existe', async () => {
      // Creamos un cliente y obtenemos su id de la respuesta
      const creado = await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ nombre: 'Cliente Test' });

      const respuesta = await request(app.getHttpServer())
        .get(`/api/clientes/${creado.body.id}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toHaveProperty('nombre', 'Cliente Test');
    });

    it('debería devolver 404 si el cliente no existe', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/api/clientes/99999')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(respuesta.status).toBe(404);
    });

    it('debería devolver 401 si no se envía token', async () => {
      const respuesta = await request(app.getHttpServer()).get(
        '/api/clientes/1',
      );

      expect(respuesta.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // POST /api/clientes
  // ─────────────────────────────────────────────
  describe('POST /api/clientes', () => {
    it('debería crear un cliente y devolverlo con su id', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ nombre: 'Nuevo Cliente' });

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toHaveProperty('id');
      expect(respuesta.body).toHaveProperty('nombre', 'Nuevo Cliente');
    });

    it('debería asignar el cliente al usuario autenticado', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ nombre: 'Nuevo Cliente' });

      expect(respuesta.status).toBe(201);
      // El usuarioId debe corresponder al usuario autenticado
      expect(respuesta.body).toHaveProperty('usuarioId');
    });

    it('debería devolver 400 si el nombre está vacío', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ nombre: '' });

      expect(respuesta.status).toBe(400);
    });

    it('debería devolver 400 si falta el nombre', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({});

      expect(respuesta.status).toBe(400);
    });

    it('debería devolver 401 si no se envía token', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/clientes')
        .send({ nombre: 'Nuevo Cliente' });

      expect(respuesta.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // PATCH /api/clientes/:id
  // ─────────────────────────────────────────────
  describe('PATCH /api/clientes/:id', () => {
    it('debería actualizar el nombre del cliente', async () => {
      const creado = await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ nombre: 'Nombre Original' });

      const respuesta = await request(app.getHttpServer())
        .patch(`/api/clientes/${creado.body.id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ nombre: 'Nombre Actualizado' });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toHaveProperty('nombre', 'Nombre Actualizado');
    });

    it('debería devolver 404 si el cliente no existe', async () => {
      const respuesta = await request(app.getHttpServer())
        .patch('/api/clientes/99999')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ nombre: 'Nuevo Nombre' });

      expect(respuesta.status).toBe(404);
    });

    it('debería devolver 401 si no se envía token', async () => {
      const respuesta = await request(app.getHttpServer())
        .patch('/api/clientes/1')
        .send({ nombre: 'Nuevo Nombre' });

      expect(respuesta.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /api/clientes/:id
  // ─────────────────────────────────────────────
  describe('DELETE /api/clientes/:id', () => {
    it('debería eliminar el cliente correctamente', async () => {
      const creado = await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ nombre: 'Cliente a Eliminar' });

      const respuesta = await request(app.getHttpServer())
        .delete(`/api/clientes/${creado.body.id}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(respuesta.status).toBe(200);

      // Verificamos que ya no existe
      const busqueda = await request(app.getHttpServer())
        .get(`/api/clientes/${creado.body.id}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(busqueda.status).toBe(404);
    });

    it('debería devolver 404 si el cliente no existe', async () => {
      const respuesta = await request(app.getHttpServer())
        .delete('/api/clientes/99999')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(respuesta.status).toBe(404);
    });

    it('debería devolver 401 si no se envía token', async () => {
      const respuesta = await request(app.getHttpServer()).delete(
        '/api/clientes/1',
      );

      expect(respuesta.status).toBe(401);
    });
  });
});
