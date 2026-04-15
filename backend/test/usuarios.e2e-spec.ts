// ─────────────────────────────────────────────────────────────────────────────
// TESTS E2E — Usuarios
//
// Rutas testeadas:
//   GET    /api/usuarios
//   GET    /api/usuarios/:id
//   PATCH  /api/usuarios/:id
//   DELETE /api/usuarios/:id
//
// Todas las rutas requieren JWT.
// GET, GET:id, POST y DELETE solo son accesibles para admin.
// PATCH es accesible para cualquier usuario autenticado.
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Usuarios E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let userToken: string;
  let userId: number;

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

  beforeEach(async () => {
    await dataSource.query('DELETE FROM registro_accesos');
    await dataSource.query('DELETE FROM interaccion');
    await dataSource.query('DELETE FROM cliente');
    await dataSource.query('DELETE FROM usuario');

    // Registramos los usuarios via API para que el hash de la contraseña sea correcto
    await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({ nombre: 'Admin Test', email: 'admin@test.com', password: 'Admin1234!' });

    // Elevamos el rol a admin directamente en BD
    await dataSource.query(
      `UPDATE usuario SET rol = 'admin' WHERE email = 'admin@test.com'`,
    );

    const userRegistro = await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({ nombre: 'User Test', email: 'user@test.com', password: 'User1234!' });
    userId = userRegistro.body.id;

    // Login para obtener tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin1234!' });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'User1234!' });
    userToken = userLogin.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────
  // GET /api/usuarios
  // ─────────────────────────────────────────────
  describe('GET /api/usuarios', () => {
    it('debería devolver lista de usuarios si es admin', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(respuesta.status).toBe(200);
      expect(Array.isArray(respuesta.body)).toBe(true);
      expect(respuesta.body.length).toBeGreaterThanOrEqual(2);
    });

    it('debería devolver 403 si no es admin', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${userToken}`);

      expect(respuesta.status).toBe(403);
    });

    it('debería devolver 401 sin token', async () => {
      const respuesta = await request(app.getHttpServer()).get('/api/usuarios');
      expect(respuesta.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // GET /api/usuarios/:id
  // ─────────────────────────────────────────────
  describe('GET /api/usuarios/:id', () => {
    it('debería devolver un usuario por id si es admin', async () => {
      const respuesta = await request(app.getHttpServer())
        .get(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toHaveProperty('id', userId);
      expect(respuesta.body).toHaveProperty('email', 'user@test.com');
      expect(respuesta.body).not.toHaveProperty('password');
    });

    it('debería devolver 403 si no es admin', async () => {
      const respuesta = await request(app.getHttpServer())
        .get(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(respuesta.status).toBe(403);
    });

    it('debería devolver 404 si el id no existe', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/api/usuarios/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(respuesta.status).toBe(404);
    });
  });

  // ─────────────────────────────────────────────
  // PATCH /api/usuarios/:id
  // ─────────────────────────────────────────────
  describe('PATCH /api/usuarios/:id', () => {
    it('debería actualizar el nombre del usuario autenticado', async () => {
      const respuesta = await request(app.getHttpServer())
        .patch(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ nombre: 'Nombre Actualizado' });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toHaveProperty('nombre', 'Nombre Actualizado');
    });

    it('debería devolver 401 sin token', async () => {
      const respuesta = await request(app.getHttpServer())
        .patch(`/api/usuarios/${userId}`)
        .send({ nombre: 'Sin token' });

      expect(respuesta.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /api/usuarios/:id
  // ─────────────────────────────────────────────
  describe('DELETE /api/usuarios/:id', () => {
    it('debería eliminar un usuario si es admin', async () => {
      const respuesta = await request(app.getHttpServer())
        .delete(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(respuesta.status).toBe(200);
    });

    it('debería devolver 403 si no es admin', async () => {
      const respuesta = await request(app.getHttpServer())
        .delete(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(respuesta.status).toBe(403);
    });

    it('debería devolver 401 sin token', async () => {
      const respuesta = await request(app.getHttpServer())
        .delete(`/api/usuarios/${userId}`)

      expect(respuesta.status).toBe(401);
    });
  });
});
