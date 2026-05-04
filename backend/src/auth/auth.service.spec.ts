// ─────────────────────────────────────────────────────────────────────────────
// TESTS UNITARIOS — AuthService
//
// Los tests unitarios comprueban que la lógica de negocio de un servicio
// funciona correctamente de forma AISLADA, sin depender de la BD, del JWT real
// ni de ningún servicio externo.
//
// Para lograr ese aislamiento usamos MOCKS: objetos falsos que simulan
// el comportamiento de las dependencias reales y nos permiten controlar
// exactamente qué devuelven en cada test.
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing'; // Utilidades de NestJS para montar módulos en entorno de test
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroAccesosService } from '../registro_accesos/registro-accesos.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────
// MOCKS DE DEPENDENCIAS
// En lugar de usar las implementaciones reales (que conectan a BD, envían emails, etc.)
// definimos objetos con los mismos métodos pero controlados por Jest.
// jest.fn() crea una función vacía que podemos configurar en cada test
// para que devuelva lo que necesitemos con mockResolvedValue() o mockReturnValue().
// ─────────────────────────────────────────────

// Mockeamos Resend para evitar intentos de envío real de email
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'test' }),
    },
  })),
}));

// Mock de UsuariosService: simula el acceso a la tabla de usuarios
const mockUsuariosService = {
  findByEmail: jest.fn(), // Buscar usuario por email
  findByResetToken: jest.fn(), // Buscar usuario por token de reset
  guardarResetToken: jest.fn(), // Guardar o limpiar el token de reset
  update: jest.fn(), // Actualizar datos del usuario (ej: nueva contraseña)
};

// Mock de JwtService: simula la firma del token JWT.
// mockReturnValue('token_falso') hace que sign() devuelva siempre ese string,
// sin necesidad de clave secreta real ni configuración de JwtModule.
const mockJwtService = {
  sign: jest.fn().mockReturnValue('token_falso'),
};

// Mock de RegistroAccesosService: simula el registro de eventos de auditoría
const mockRegistroAccesosService = {
  registrar: jest.fn(),
};

// ─────────────────────────────────────────────
// USUARIO DE PRUEBA REUTILIZABLE
// Objeto que simula un usuario de la BD. Lo usamos como base en varios tests.
// El campo password se rellena en cada test que lo necesite,
// porque el hash de bcrypt es distinto cada vez.
// ─────────────────────────────────────────────
const usuarioMock = {
  id: 1,
  nombre: 'user Test',
  email: 'user@test.com',
  password: '', // se asigna el hash correspondiente en cada test
  rol: 'user',
  reset_token_expiry: null,
};

// describe() agrupa los tests relacionados bajo un nombre descriptivo.
// El describe exterior engloba todos los tests del AuthService.
describe('AuthService', () => {
  let service: AuthService; // Instancia del servicio que vamos a testear

  // beforeEach() se ejecuta antes de CADA test individual.
  // Aquí montamos el módulo de testing y obtenemos una instancia limpia del service.
  beforeEach(async () => {
    // Test.createTestingModule() crea un módulo NestJS de prueba.
    // En providers declaramos el service real (AuthService) junto con
    // los mocks en lugar de las implementaciones reales.
    // useValue le dice a NestJS: "cuando alguien pida UsuariosService,
    // dale este objeto mock en su lugar".
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService, // El service que queremos testear — este sí es real
        { provide: UsuariosService, useValue: mockUsuariosService },
        { provide: JwtService, useValue: mockJwtService },
        {
          provide: RegistroAccesosService,
          useValue: mockRegistroAccesosService,
        },
      ],
    }).compile();

    // Obtenemos la instancia del service ya con las dependencias mockeadas inyectadas
    service = module.get<AuthService>(AuthService);

    // Limpiamos el historial de llamadas de todos los mocks antes de cada test.
    // Sin esto, las llamadas del test anterior contaminarían las comprobaciones
    // del siguiente (ej: registrar() aparecería como llamada 2 veces en el test 2).
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // LOGIN
  // Verificamos todos los caminos posibles del método login():
  // usuario inexistente, password incorrecta, login correcto,
  // auditoría y seguridad del mensaje de error.
  // ─────────────────────────────────────────────
  describe('login', () => {
    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      // Configuramos el mock para que findByEmail devuelva null (usuario no encontrado)
      mockUsuariosService.findByEmail.mockResolvedValue(null);

      // rejects.toThrow() verifica que la promesa se rechaza con esa excepción
      await expect(
        service.login('noexiste@test.com', '12345678'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      // Hasheamos una password correcta y la asignamos al usuario mock
      const hash = await bcrypt.hash('passwordCorrecta', 10);
      mockUsuariosService.findByEmail.mockResolvedValue({
        ...usuarioMock,
        password: hash,
      });

      // Intentamos login con una password diferente — debe lanzar 401
      await expect(
        service.login('user@test.com', 'passwordIncorrecta'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería devolver token y datos del usuario si las credenciales son correctas', async () => {
      const hash = await bcrypt.hash('Password1!', 10);
      mockUsuariosService.findByEmail.mockResolvedValue({
        ...usuarioMock,
        password: hash,
      });

      const resultado = await service.login('user@test.com', 'Password1!');

      // toHaveProperty() comprueba que el objeto tiene esa clave con ese valor
      expect(resultado).toHaveProperty('token', 'token_falso');
      // toMatchObject() comprueba que el objeto contiene al menos esas propiedades
      // (pueden existir más propiedades — no falla por eso)
      expect(resultado.usuario).toMatchObject({
        id: 1,
        email: 'user@test.com',
        rol: 'user',
      });
    });

    it('debería registrar el evento de login al autenticarse correctamente', async () => {
      const hash = await bcrypt.hash('Password1!', 10);
      mockUsuariosService.findByEmail.mockResolvedValue({
        ...usuarioMock,
        password: hash,
      });

      await service.login('user@test.com', 'Password1!');

      // toHaveBeenCalledWith() verifica que la función mock fue llamada
      // exactamente con esos argumentos
      expect(mockRegistroAccesosService.registrar).toHaveBeenCalledWith(
        1,
        'login',
      );
    });

    it('no debería revelar si el email existe o no (mismo mensaje de error)', async () => {
      // SEGURIDAD: comprobamos que el mensaje de error es idéntico tanto cuando
      // el email no existe como cuando la contraseña es incorrecta.
      // Si fueran mensajes distintos, un atacante podría saber qué emails están registrados.

      // Caso 1: email inexistente
      mockUsuariosService.findByEmail.mockResolvedValue(null);
      let mensajeEmailInexistente = '';
      try {
        await service.login('noexiste@test.com', 'Password1!');
      } catch (e) {
        mensajeEmailInexistente = e.message;
      }

      // Caso 2: email existe pero password incorrecta
      const hash = await bcrypt.hash('Password1!', 10);
      mockUsuariosService.findByEmail.mockResolvedValue({
        ...usuarioMock,
        password: hash,
      });
      let mensajePasswordIncorrecta = '';
      try {
        await service.login('user@test.com', 'WrongPass1!');
      } catch (e) {
        mensajePasswordIncorrecta = e.message;
      }

      // Ambos mensajes deben ser exactamente iguales
      expect(mensajeEmailInexistente).toBe(mensajePasswordIncorrecta);
    });
  });

  // ─────────────────────────────────────────────
  // LOGOUT
  // El logout es stateless (no invalida el token en servidor),
  // solo registra el evento y devuelve confirmación.
  // ─────────────────────────────────────────────
  describe('logout', () => {
    it('debería registrar el evento de logout', async () => {
      await service.logout(1);
      // Verificamos que se registró el evento con el id correcto y la acción 'logout'
      expect(mockRegistroAccesosService.registrar).toHaveBeenCalledWith(
        1,
        'logout',
      );
    });

    it('debería devolver mensaje de confirmación', async () => {
      const resultado = await service.logout(1);
      // toEqual() compara el objeto completo en profundidad (deep equality)
      expect(resultado).toEqual({ message: 'Sesión cerrada correctamente' });
    });
  });

  // ─────────────────────────────────────────────
  // FORGOT PASSWORD
  // Verificamos que no se revela si el email existe
  // y que el token se guarda correctamente cuando sí existe.
  // No testeamos el envío de email porque nodemailer es externo
  // y el service ya lo captura con try/catch internamente.
  // ─────────────────────────────────────────────
  describe('forgotPassword', () => {
    it('debería devolver el mensaje genérico aunque el email no exista (no revela info)', async () => {
      mockUsuariosService.findByEmail.mockResolvedValue(null);

      const resultado = await service.forgotPassword('noexiste@test.com');

      // El mensaje debe ser el mismo que si el email existiera
      expect(resultado).toEqual({
        message: 'Si el email existe, recibirás un enlace',
      });

      // Si el usuario no existe, no debe intentar guardar ningún token en BD
      expect(mockUsuariosService.guardarResetToken).not.toHaveBeenCalled();
    });

    it('debería guardar el token de reset si el usuario existe', async () => {
      mockUsuariosService.findByEmail.mockResolvedValue(usuarioMock);
      mockUsuariosService.guardarResetToken.mockResolvedValue(undefined);

      await service.forgotPassword('user@test.com');

      // expect.any(String) acepta cualquier string — el token es hex aleatorio,
      // no podemos saber su valor exacto de antemano.
      // expect.any(Date) acepta cualquier objeto Date — la expiración se calcula en runtime.
      expect(mockUsuariosService.guardarResetToken).toHaveBeenCalledWith(
        'user@test.com',
        expect.any(String),
        expect.any(Date),
      );
    });
  });

  // ─────────────────────────────────────────────
  // RESET PASSWORD
  // Verificamos todos los casos: token inválido, token caducado,
  // actualización correcta, limpieza del token y mensaje de confirmación.
  // ─────────────────────────────────────────────
  describe('resetPassword', () => {
    it('debería lanzar BadRequestException si el token no existe', async () => {
      // findByResetToken devuelve null — nadie tiene ese token en BD
      mockUsuariosService.findByResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword('token_invalido', 'NuevaPass1!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si el token ha caducado', async () => {
      // Simulamos un usuario con token expirado hace 1 segundo.
      // Date.now() - 1000 = 1 segundo en el pasado
      mockUsuariosService.findByResetToken.mockResolvedValue({
        ...usuarioMock,
        reset_token_expiry: new Date(Date.now() - 1000),
      });

      await expect(
        service.resetPassword('token_caducado', 'NuevaPass1!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería actualizar la contraseña hasheada si el token es válido', async () => {
      // Token válido con expiración en 1 hora
      mockUsuariosService.findByResetToken.mockResolvedValue({
        ...usuarioMock,
        reset_token_expiry: new Date(Date.now() + 60 * 60 * 1000),
      });
      mockUsuariosService.update.mockResolvedValue(undefined);
      mockUsuariosService.guardarResetToken.mockResolvedValue(undefined);

      await service.resetPassword('token_valido', 'NuevaPass1!');

      // Verificamos que update fue llamado con el id correcto
      // y que la password guardada es un string (el hash) — nunca el texto plano
      expect(mockUsuariosService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ password: expect.any(String) }),
      );
    });

    it('debería limpiar el token tras el reset para que no se reutilice', async () => {
      mockUsuariosService.findByResetToken.mockResolvedValue({
        ...usuarioMock,
        reset_token_expiry: new Date(Date.now() + 60 * 60 * 1000),
      });
      mockUsuariosService.update.mockResolvedValue(undefined);
      mockUsuariosService.guardarResetToken.mockResolvedValue(undefined);

      await service.resetPassword('token_valido', 'NuevaPass1!');

      // Tras el reset, guardarResetToken debe llamarse con null, null
      // para invalidar el token y evitar que se reutilice
      expect(mockUsuariosService.guardarResetToken).toHaveBeenCalledWith(
        usuarioMock.email,
        null,
        null,
      );
    });

    it('debería devolver mensaje de confirmación tras el reset', async () => {
      mockUsuariosService.findByResetToken.mockResolvedValue({
        ...usuarioMock,
        reset_token_expiry: new Date(Date.now() + 60 * 60 * 1000),
      });
      mockUsuariosService.update.mockResolvedValue(undefined);
      mockUsuariosService.guardarResetToken.mockResolvedValue(undefined);

      const resultado = await service.resetPassword(
        'token_valido',
        'NuevaPass1!',
      );

      expect(resultado).toEqual({
        message: 'Contraseña actualizada correctamente',
      });
    });
  });
});
