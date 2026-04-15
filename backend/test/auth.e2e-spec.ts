// ─────────────────────────────────────────────────────────────────────────────
// TESTS E2E — Auth
//
// Los tests E2E (end-to-end) levantan la aplicación NestJS completa
// y hacen peticiones HTTP reales a los endpoints usando supertest.
// A diferencia de los tests unitarios, aquí no hay mocks —
// se usa la BD de pruebas real (pwa_interacciones).
//
// Rutas testeadas:
//   POST /api/auth/registro
//   POST /api/auth/login
//   POST /api/auth/logout
//   POST /api/auth/forgot-password
//   POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test' }),
  }),
}));

describe('Auth E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource; // Conexión a la BD de pruebas para limpiar datos entre tests

  // ─────────────────────────────────────────────
  // SETUP
  // Levantamos la aplicación completa antes de todos los tests.
  // Usamos beforeAll (no beforeEach) para no levantar/cerrar la app
  // en cada test — es costoso y lento.
  // ─────────────────────────────────────────────
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Importamos el módulo raíz completo — igual que en producción
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplicamos la misma configuración que en main.ts para que el comportamiento sea idéntico
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();

    // Obtenemos la conexión a BD para poder limpiar datos entre tests
    dataSource = app.get(DataSource);
  });

  // ─────────────────────────────────────────────
  // LIMPIEZA
  // Antes de cada test limpiamos las tablas de prueba
  // para que los tests sean independientes entre sí.
  // Borramos en orden correcto respetando las foreign keys.
  // ─────────────────────────────────────────────
  beforeEach(async () => {
    await dataSource.query('DELETE FROM registro_accesos');
    await dataSource.query('DELETE FROM interaccion');
    await dataSource.query('DELETE FROM cliente');
    await dataSource.query('DELETE FROM usuario');
  });

  // Cerramos la app después de todos los tests para liberar recursos
  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────
  // REGISTRO
  // ─────────────────────────────────────────────
  describe('POST /api/auth/registro', () => {
    it('debería registrar un nuevo usuario y devolver los datos sin password', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/registro')
        .send({
          nombre: 'user Test',
          email: 'user@test.com',
          password: 'Password1!',
        });

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toHaveProperty('id');
      expect(respuesta.body).toHaveProperty('email', 'user@test.com');
      // La password nunca debe aparecer en la respuesta
      expect(respuesta.body).not.toHaveProperty('password');
    });

    it('debería devolver 400 si el email no tiene formato válido', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/registro')
        .send({
          nombre: 'user Test',
          email: 'emailinvalido',
          password: 'Password1!',
        });

      expect(respuesta.status).toBe(400);
    });

    it('debería devolver 400 si la password no cumple los requisitos', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/registro')
        .send({
          nombre: 'user Test',
          email: 'user@test.com',
          password: 'sinmayuscula', // sin mayúscula ni carácter especial
        });

      expect(respuesta.status).toBe(400);
    });

    it('debería devolver 400 si faltan campos obligatorios', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/registro')
        .send({
          email: 'user@test.com',
          // sin nombre ni password
        });

      expect(respuesta.status).toBe(400);
    });
  });

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    // Creamos un usuario antes de cada test de login
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/api/auth/registro').send({
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
      });
    });

    it('debería devolver token y datos del usuario con credenciales correctas', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'Password1!',
        });

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toHaveProperty('token');
      expect(respuesta.body.usuario).toMatchObject({
        email: 'user@test.com',
        rol: 'user',
      });
      // La password nunca debe aparecer en la respuesta
      expect(respuesta.body.usuario).not.toHaveProperty('password');
    });

    it('debería devolver 401 si la password es incorrecta', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'WrongPass1!',
        });

      expect(respuesta.status).toBe(401);
    });

    it('debería devolver 401 si el email no está registrado', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: 'Password1!',
        });

      expect(respuesta.status).toBe(401);
    });

    it('debería devolver 400 si el email no tiene formato válido', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'emailinvalido',
          password: 'Password1!',
        });

      expect(respuesta.status).toBe(400);
    });
  });

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('debería cerrar sesión correctamente con token válido', async () => {
      // Registramos y hacemos login para obtener el token
      await request(app.getHttpServer()).post('/api/auth/registro').send({
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
      });

      const login = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'Password1!',
        });

      const token = login.body.token;

      // Enviamos el token en el header Authorization: Bearer <token>
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toEqual({
        message: 'Sesión cerrada correctamente',
      });
    });

    it('debería devolver 401 si no se envía token', async () => {
      const respuesta = await request(app.getHttpServer()).post(
        '/api/auth/logout',
      );

      expect(respuesta.status).toBe(401);
    });

    it('debería devolver 401 si el token es inválido', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer token_falso_invalido');

      expect(respuesta.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // FORGOT PASSWORD
  // No testeamos el envío real del email — solo que el endpoint
  // responde correctamente y no revela si el email existe.
  // ─────────────────────────────────────────────
  describe('POST /api/auth/forgot-password', () => {
    it('debería devolver el mensaje genérico si el email existe', async () => {
      await request(app.getHttpServer()).post('/api/auth/registro').send({
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
      });

      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'user@test.com' });

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toEqual({
        message: 'Si el email existe, recibirás un enlace',
      });
    });

    it('debería devolver el mismo mensaje genérico si el email no existe', async () => {
      // SEGURIDAD: el mensaje debe ser idéntico tanto si el email existe como si no
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'noexiste@test.com' });

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toEqual({
        message: 'Si el email existe, recibirás un enlace',
      });
    });
  });

  // ─────────────────────────────────────────────
  // RESET PASSWORD
  // Insertamos el token directamente en BD para evitar depender
  // del envío real del email en los tests.
  // ─────────────────────────────────────────────
  describe('POST /api/auth/reset-password', () => {
    it('debería actualizar la contraseña con un token válido', async () => {
      // 1. Registramos el usuario
      await request(app.getHttpServer()).post('/api/auth/registro').send({
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
      });

      // 2. Insertamos el token directamente en BD con expiración en 1 hora
      const token = 'token_test_valido_123';
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      await dataSource.query(
        `UPDATE usuario SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`,
        [token, expiry, 'user@test.com'],
      );

      // 3. Llamamos al endpoint con el token y la nueva contraseña
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token, password: 'NuevaPassword1!' });

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toEqual({
        message: 'Contraseña actualizada correctamente',
      });
    });

    it('debería permitir login con la nueva contraseña tras el reset', async () => {
      await request(app.getHttpServer()).post('/api/auth/registro').send({
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
      });

      const token = 'token_test_valido_456';
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      await dataSource.query(
        `UPDATE usuario SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`,
        [token, expiry, 'user@test.com'],
      );

      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token, password: 'NuevaPassword1!' });

      // Verificamos que podemos hacer login con la nueva contraseña
      const login = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'NuevaPassword1!',
        });

      expect(login.status).toBe(201);
      expect(login.body).toHaveProperty('token');
    });

    it('debería devolver 400 si el token no existe', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          token: 'token_que_no_existe',
          password: 'NuevaPassword1!',
        });

      expect(respuesta.status).toBe(400);
    });

    it('debería devolver 400 si el token ha caducado', async () => {
      await request(app.getHttpServer()).post('/api/auth/registro').send({
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
      });

      // Token ya caducado — 1 segundo en el pasado
      const token = 'token_caducado_789';
      const expiry = new Date(Date.now() - 1000);
      await dataSource.query(
        `UPDATE usuario SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`,
        [token, expiry, 'user@test.com'],
      );

      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token, password: 'NuevaPassword1!' });

      expect(respuesta.status).toBe(400);
    });

    it('no debería poder reutilizar el token tras el reset', async () => {
      await request(app.getHttpServer()).post('/api/auth/registro').send({
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
      });

      const token = 'token_unico_101';
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      await dataSource.query(
        `UPDATE usuario SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`,
        [token, expiry, 'user@test.com'],
      );

      // Primer reset — debe funcionar
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token, password: 'NuevaPassword1!' });

      // Segundo intento con el mismo token — debe fallar porque se limpió en BD
      const respuesta = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token, password: 'OtraPassword1!' });

      expect(respuesta.status).toBe(400);
    });
  });
});
