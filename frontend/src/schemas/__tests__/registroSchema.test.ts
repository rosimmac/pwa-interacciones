/**
 * Tests unitarios de registroSchema.
 *
 * Cubre las reglas de validación del formulario de registro:
 *   - Longitud mínima del nombre (≥ 2 caracteres)
 *   - Formato de email
 *   - Complejidad de contraseña: longitud mínima, mayúscula y carácter especial
 *   - Refinement cross-field: las dos contraseñas deben coincidir
 */

import { describe, it, expect } from "vitest";
import { registroSchema } from "../registroSchema";

/**
 * Fixture con todos los campos en un estado válido.
 * Los tests de casos inválidos parten de este objeto y sobreescriben
 * únicamente el campo que quieren poner a prueba.
 */
const datosValidos = {
  nombre: "Ana García",
  email: "ana@ejemplo.com",
  password: "Seguro1!",
  confirmarPassword: "Seguro1!",
};

describe("registroSchema", () => {
  // ── Caso feliz ───────────────────────────────────────────────────────────

  it("acepta datos válidos", () => {
    const result = registroSchema.safeParse(datosValidos);
    expect(result.success).toBe(true);
  });

  // ── Validaciones de nombre ───────────────────────────────────────────────

  it("rechaza nombre con menos de 2 caracteres", () => {
    // Un único carácter no supera el mínimo definido en el esquema.
    const result = registroSchema.safeParse({ ...datosValidos, nombre: "A" });
    expect(result.success).toBe(false);
    // Usamos ?? "" para que TypeScript no trate el acceso a `message` como posiblemente undefined.
    const mensaje = result.error?.issues[0].message ?? "";
    expect(mensaje).toContain("mín. 2 caracteres");
  });

  // ── Validaciones de email ────────────────────────────────────────────────

  it("rechaza email con formato inválido", () => {
    const result = registroSchema.safeParse({
      ...datosValidos,
      email: "noesemail",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("email válido");
  });

  // ── Validaciones de contraseña ───────────────────────────────────────────

  it("rechaza contraseña con menos de 8 caracteres", () => {
    // La constraseña de confirmación coincide con la principal para aislar
    // este error del refinement de coincidencia.
    const result = registroSchema.safeParse({
      ...datosValidos,
      password: "Ab1!",
      confirmarPassword: "Ab1!",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("8 caracteres");
  });

  it("rechaza contraseña sin mayúscula", () => {
    // El regex /(?=.*[A-Z])/ requiere al menos un carácter en mayúscula.
    const result = registroSchema.safeParse({
      ...datosValidos,
      password: "seguro1!",
      confirmarPassword: "seguro1!",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("mayúscula");
  });

  it("rechaza contraseña sin carácter especial", () => {
    // El regex require al menos un símbolo del conjunto !@#$%^&*()_+...
    const result = registroSchema.safeParse({
      ...datosValidos,
      password: "Seguro123",
      confirmarPassword: "Seguro123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("especial");
  });

  // ── Refinement cross-field ───────────────────────────────────────────────

  it("rechaza cuando las contraseñas no coinciden", () => {
    // El refinement se ejecuta después de validar cada campo individualmente.
    // El error se añade al path ["confirmarPassword"].
    const result = registroSchema.safeParse({
      ...datosValidos,
      confirmarPassword: "Distinto1!",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("no coinciden");
  });
});
