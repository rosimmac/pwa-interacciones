/**
 * Tests unitarios de loginSchema.
 *
 * Valida las reglas del esquema Zod usado en el formulario de inicio
 * de sesión: formato de email y presencia de contraseña.
 * Se usa `safeParse` en lugar de `parse` para obtener el resultado sin
 * lanzar excepciones, facilitando las aserciones sobre errores.
 */

import { describe, it, expect } from "vitest";
import { loginSchema } from "../loginSchema";

describe("loginSchema", () => {
  // ── Caso feliz ───────────────────────────────────────────────────────────

  it("acepta datos válidos", () => {
    const result = loginSchema.safeParse({
      email: "usuario@ejemplo.com",
      password: "contraseña123",
    });
    expect(result.success).toBe(true);
  });

  // ── Validaciones de email ────────────────────────────────────────────────

  it("rechaza email vacío", () => {
    // Una cadena vacía no supera la validación de formato RFC 5322 de Zod.
    const result = loginSchema.safeParse({ email: "", password: "secret" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Introduce un email válido");
  });

  it("rechaza email con formato inválido", () => {
    // Verifica que una cadena sin '@' ni dominio sea rechazada.
    const result = loginSchema.safeParse({
      email: "no-es-un-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Introduce un email válido");
  });

  // ── Validaciones de contraseña ───────────────────────────────────────────

  it("rechaza contraseña vacía", () => {
    // El esquema solo exige presencia (min 1 carácter), no complejidad.
    const result = loginSchema.safeParse({
      email: "usuario@ejemplo.com",
      password: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("La contraseña es obligatoria");
  });
});
