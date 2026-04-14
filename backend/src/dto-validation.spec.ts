// ─────────────────────────────────────────────────────────────────────────────
// TESTS DE VALIDACIÓN — DTOs
//
// Testeamos que los decoradores de class-validator funcionan correctamente
// en cada DTO: que rechazan datos inválidos y aceptan datos válidos.
//
// No usamos NestJS ni mocks — instanciamos el DTO directamente y lo pasamos
// por validate() de class-validator, igual que hace el ValidationPipe
// de NestJS internamente cuando llega una petición HTTP.
//
// validate() devuelve un array de ValidationError:
//   - Array vacío → todos los campos son válidos
//   - Array con errores → algún campo no cumple las validaciones
// ─────────────────────────────────────────────────────────────────────────────

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer'; // Convierte objetos planos a instancias de clase con sus decoradores
import { LoginDto } from './auth/dto/login.dto';
import { RegistroDto } from './auth/dto/registro.dto';
import { CreateClienteDto } from './clientes/dto/create-cliente.dto';
import { CreateInteraccionDto } from './interacciones/dto/create-interaccion.dto';
import { CreateUsuarioDto } from './usuarios/dto/create.usuario.dto';

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN DTO
// Valida: email con formato correcto, password mínimo 8 caracteres
// ─────────────────────────────────────────────────────────────────────────────
describe('LoginDto', () => {
  it('debería validar correctamente con datos válidos', async () => {
    // plainToInstance() convierte el objeto plano a una instancia real de LoginDto
    // con todos sus decoradores activos — necesario para que validate() funcione
    const dto = plainToInstance(LoginDto, {
      email: 'user@test.com',
      password: 'Password1!',
    });

    const errores = await validate(dto);

    // Array vacío significa que todos los campos pasaron la validación
    expect(errores).toHaveLength(0);
  });

  it('debería fallar si el email no tiene formato válido', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'esto-no-es-un-email',
      password: 'Password1!',
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    // Verificamos que el error es específicamente del campo email
    expect(errores[0].property).toBe('email');
  });

  it('debería fallar si el email está vacío', async () => {
    const dto = plainToInstance(LoginDto, {
      email: '',
      password: 'Password1!',
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('email');
  });

  it('debería fallar si la password tiene menos de 8 caracteres', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'user@test.com',
      password: 'corta', // solo 5 caracteres
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('password');
  });

  it('debería fallar si la password está vacía', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'user@test.com',
      password: '',
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
  });

  it('debería fallar si faltan campos obligatorios', async () => {
    const dto = plainToInstance(LoginDto, {}); // sin email ni password

    const errores = await validate(dto);

    // Deben fallar los dos campos
    expect(errores.length).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRO DTO
// Valida: nombre string, email válido, password con mayúscula y carácter especial,
//         rol opcional pero solo valores permitidos
// ─────────────────────────────────────────────────────────────────────────────
describe('RegistroDto', () => {
  it('debería validar correctamente con datos válidos', async () => {
    const dto = plainToInstance(RegistroDto, {
      nombre: 'user Test',
      email: 'user@test.com',
      password: 'Password1!',
      rol: 'user',
    });

    const errores = await validate(dto);

    expect(errores).toHaveLength(0);
  });

  it('debería validar correctamente sin rol (es opcional)', async () => {
    const dto = plainToInstance(RegistroDto, {
      nombre: 'user Test',
      email: 'user@test.com',
      password: 'Password1!',
      // sin rol — es @IsOptional()
    });

    const errores = await validate(dto);

    expect(errores).toHaveLength(0);
  });

  it('debería fallar si la password no tiene mayúscula', async () => {
    const dto = plainToInstance(RegistroDto, {
      nombre: 'user Test',
      email: 'user@test.com',
      password: 'password1!', // sin mayúscula
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('password');
  });

  it('debería fallar si la password no tiene carácter especial', async () => {
    const dto = plainToInstance(RegistroDto, {
      nombre: 'user Test',
      email: 'user@test.com',
      password: 'Password1', // sin carácter especial
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('password');
  });

  it('debería fallar si la password tiene menos de 8 caracteres', async () => {
    const dto = plainToInstance(RegistroDto, {
      nombre: 'user Test',
      email: 'user@test.com',
      password: 'Pass1!', // solo 6 caracteres
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('password');
  });

  it('debería fallar si el rol no es un valor permitido', async () => {
    const dto = plainToInstance(RegistroDto, {
      nombre: 'user Test',
      email: 'user@test.com',
      password: 'Password1!',
      rol: 'superadmin', // valor no permitido
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('rol');
  });

  it('debería aceptar todos los roles válidos', async () => {
    const roles = ['admin', 'user', 'read-only'];

    for (const rol of roles) {
      const dto = plainToInstance(RegistroDto, {
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
        rol,
      });

      const errores = await validate(dto);
      expect(errores).toHaveLength(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CREATE CLIENTE DTO
// Valida: nombre obligatorio y no vacío
// ─────────────────────────────────────────────────────────────────────────────
describe('CreateClienteDto', () => {
  it('debería validar correctamente con nombre válido', async () => {
    const dto = plainToInstance(CreateClienteDto, {
      nombre: 'Empresa Test S.L.',
    });

    const errores = await validate(dto);

    expect(errores).toHaveLength(0);
  });

  it('debería fallar si el nombre está vacío', async () => {
    const dto = plainToInstance(CreateClienteDto, {
      nombre: '', // @IsNotEmpty() debe rechazarlo
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('nombre');
  });

  it('debería fallar si el nombre no es un string', async () => {
    const dto = plainToInstance(CreateClienteDto, {
      nombre: 12345, // @IsString() debe rechazarlo
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('nombre');
  });

  it('debería fallar si falta el nombre', async () => {
    const dto = plainToInstance(CreateClienteDto, {}); // sin nombre

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CREATE INTERACCION DTO
// Valida: fecha en formato ISO, descripcion opcional, ids numéricos obligatorios
// ─────────────────────────────────────────────────────────────────────────────
describe('CreateInteraccionDto', () => {
  it('debería validar correctamente con datos válidos', async () => {
    const dto = plainToInstance(CreateInteraccionDto, {
      fecha: '2024-01-01',
      descripcion: 'Llamada de seguimiento',
      clienteId: 1,
      tipoId: 2,
      estadoId: 3,
      usuarioId: 10,
    });

    const errores = await validate(dto);

    expect(errores).toHaveLength(0);
  });

  it('debería validar correctamente sin descripcion (es opcional)', async () => {
    const dto = plainToInstance(CreateInteraccionDto, {
      fecha: '2024-01-01',
      // sin descripcion — es @IsOptional()
      clienteId: 1,
      tipoId: 2,
      estadoId: 3,
      usuarioId: 10,
    });

    const errores = await validate(dto);

    expect(errores).toHaveLength(0);
  });

  it('debería fallar si la fecha no tiene formato ISO válido', async () => {
    const dto = plainToInstance(CreateInteraccionDto, {
      fecha: 'no-es-una-fecha', // @IsDateString() debe rechazarlo
      clienteId: 1,
      tipoId: 2,
      estadoId: 3,
      usuarioId: 10,
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('fecha');
  });

  it('debería fallar si clienteId no es un número', async () => {
    const dto = plainToInstance(CreateInteraccionDto, {
      fecha: '2024-01-01',
      clienteId: 'uno', // @IsNumber() debe rechazarlo
      tipoId: 2,
      estadoId: 3,
      usuarioId: 10,
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('clienteId');
  });

  it('debería fallar si faltan campos obligatorios', async () => {
    const dto = plainToInstance(CreateInteraccionDto, {
      fecha: '2024-01-01',
      // sin clienteId, tipoId, estadoId, usuarioId
    });

    const errores = await validate(dto);

    // Deben fallar los 4 campos numéricos obligatorios
    expect(errores.length).toBe(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CREATE USUARIO DTO
// Valida: nombre string, email válido, password con mayúscula y carácter especial,
//         rol obligatorio con valores permitidos
// ─────────────────────────────────────────────────────────────────────────────
describe('CreateUsuarioDto', () => {
  it('debería validar correctamente con datos válidos', async () => {
    const dto = plainToInstance(CreateUsuarioDto, {
      nombre: 'user Test',
      email: 'user@test.com',
      password: 'Password1!',
      rol: 'admin',
    });

    const errores = await validate(dto);

    expect(errores).toHaveLength(0);
  });

  it('debería fallar si el email no tiene formato válido', async () => {
    const dto = plainToInstance(CreateUsuarioDto, {
      nombre: 'user Test',
      email: 'emailinvalido',
      password: 'Password1!',
      rol: 'admin',
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('email');
  });

  it('debería fallar si la password no cumple los requisitos de seguridad', async () => {
    const casos = [
      'sinmayuscula1!', // sin mayúscula
      'SinEspecial1', // sin carácter especial
      'Cort1!', // menos de 8 caracteres
    ];

    for (const password of casos) {
      const dto = plainToInstance(CreateUsuarioDto, {
        nombre: 'user Test',
        email: 'user@test.com',
        password,
        rol: 'admin',
      });

      const errores = await validate(dto);
      expect(errores.length).toBeGreaterThan(0);
    }
  });

  it('debería fallar si el rol no es válido', async () => {
    const dto = plainToInstance(CreateUsuarioDto, {
      nombre: 'user Test',
      email: 'user@test.com',
      password: 'Password1!',
      rol: 'superadmin', // valor no permitido
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('rol');
  });

  it('debería fallar si el rol está ausente (es obligatorio)', async () => {
    // A diferencia de RegistroDto, aquí el rol NO es opcional
    const dto = plainToInstance(CreateUsuarioDto, {
      nombre: 'user Test',
      email: 'user@test.com',
      password: 'Password1!',
      // sin rol
    });

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('rol');
  });

  it('debería aceptar todos los roles válidos', async () => {
    const roles = ['admin', 'user', 'read-only'];

    for (const rol of roles) {
      const dto = plainToInstance(CreateUsuarioDto, {
        nombre: 'user Test',
        email: 'user@test.com',
        password: 'Password1!',
        rol,
      });

      const errores = await validate(dto);
      expect(errores).toHaveLength(0);
    }
  });
});
