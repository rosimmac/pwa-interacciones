/**
 * Tests unitarios de usuarioSchema.
 *
 * Además de email y complejidad de contraseña, este esquema añade:
 *   - Campo `rol` como enum estricto ("admin" | "user" | "read-only")
 *   - Campo `nombre` con límite máximo de 50 caracteres
 *   - Contraseña opcional: `z.string().min(8)...or(z.literal(""))` permite
 *     enviar la cadena vacía cuando se edita un usuario sin cambiar su pwd.
 */

import { describe, it, expect } from "vitest";
import { usuarioSchema } from "../usuarioSchema";

/**
 * Fixture base con todos los campos válidos.
 * `as const` en `rol` es necesario para que TypeScript infiera el tipo
 * literal "user" en lugar del tipo ampliado string.
 */
const datosValidos = {
  nombre: "Carlos López",
  email: "carlos@empresa.com",
  password: "Seguro1!",
  rol: "user" as const,
};

describe("usuarioSchema", () => {
  // ── Casos felices ────────────────────────────────────────────────────────

  it("acepta datos válidos con contraseña", () => {
    const result = usuarioSchema.safeParse(datosValidos);
    expect(result.success).toBe(true);
  });

  it("acepta contraseña vacía (edición sin cambio de contraseña)", () => {
    // La unión `.or(z.literal(""))` permite omitir la contraseña al editar
    // un usuario existente sin necesidad de que el backend la regenere.
    const result = usuarioSchema.safeParse({ ...datosValidos, password: "" });
    expect(result.success).toBe(true);
  });

  // ── Validaciones de nombre ───────────────────────────────────────────────

  it("rechaza nombre vacío", () => {
    // min(1) garantiza que el campo no se envíe en blanco.
    const result = usuarioSchema.safeParse({ ...datosValidos, nombre: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("obligatorio");
  });

  it("rechaza nombre con más de 50 caracteres", () => {
    // max(50) previene desbordamientos en la columna de la base de datos.
    const result = usuarioSchema.safeParse({
      ...datosValidos,
      nombre: "A".repeat(51),
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("50 caracteres");
  });

  it("acepta nombre exactamente en el límite de 50 caracteres", () => {
    // Test de valor límite: 50 caracteres debe ser aceptado (límite inclusivo).
    const result = usuarioSchema.safeParse({
      ...datosValidos,
      nombre: "A".repeat(50),
    });
    expect(result.success).toBe(true);
  });

  // ── Validaciones de email ────────────────────────────────────────────────

  it("rechaza email inválido", () => {
    const result = usuarioSchema.safeParse({
      ...datosValidos,
      email: "noesvalido",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("válido");
  });

  // ── Validaciones de rol ──────────────────────────────────────────────────

  it("rechaza rol no permitido", () => {
    // z.enum lanza un error si el valor no pertenece al conjunto permitido.
    // No se comprueba el mensaje exacto porque Zod lo genera automáticamente.
    const result = usuarioSchema.safeParse({
      ...datosValidos,
      rol: "superadmin",
    });
    expect(result.success).toBe(false);
  });

  // ── Validaciones de contraseña (rama no vacía) ───────────────────────────

  it("rechaza contraseña no vacía sin mayúscula", () => {
    // Cuando la contraseña no está vacía, debe cumplir todas las reglas
    // de complejidad. La rama z.literal("") solo acepta la cadena vacía exacta.
    const result = usuarioSchema.safeParse({
      ...datosValidos,
      password: "seguro1!",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("mayúscula");
  });
});
