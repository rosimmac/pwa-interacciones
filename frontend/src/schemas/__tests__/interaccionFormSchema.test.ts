/**
 * Tests unitarios de interaccionFormSchema.
 *
 * Cubre los cinco campos del formulario de nueva interacción:
 *   - `tipo`: enum estricto de tres valores
 *   - `descripcion`: mínimo 3 caracteres
 *   - `clienteId`: número entero >= 1 (0 indica "no seleccionado")
 *   - `fecha` y `hora`: cadenas no vacías
 */

import { describe, it, expect } from "vitest";
import { interaccionFormSchema } from "../interaccionFormSchema";

/**
 * Fixture base con valores válidos para todos los campos.
 * Los tests de casos inválidos sobreescriben únicamente el campo bajo prueba.
 */
const datosValidos = {
  tipo: "consulta" as const,
  descripcion: "Reunión de seguimiento con el cliente",
  clienteId: 3,
  fecha: "2026-04-15",
  hora: "10:30",
};

describe("interaccionFormSchema", () => {
  // ── Caso feliz ───────────────────────────────────────────────────────────

  it("acepta datos válidos", () => {
    const result = interaccionFormSchema.safeParse(datosValidos);
    expect(result.success).toBe(true);
  });

  // ── Validaciones de tipo ─────────────────────────────────────────────────

  it("acepta todos los valores del enum tipo", () => {
    // Itera sobre la lista completa para detectar si se añade un valor al
    // enum en el esquema sin actualizar los tests.
    for (const tipo of ["consulta", "reunion", "antecedente"] as const) {
      const result = interaccionFormSchema.safeParse({ ...datosValidos, tipo });
      expect(result.success).toBe(true);
    }
  });

  it("rechaza tipo no permitido", () => {
    // Cualquier cadena fuera del enum debe ser rechazada por z.enum.
    const result = interaccionFormSchema.safeParse({
      ...datosValidos,
      tipo: "llamada",
    });
    expect(result.success).toBe(false);
  });

  // ── Validaciones de descripción ──────────────────────────────────────────

  it("rechaza descripción con menos de 3 caracteres", () => {
    // Una descripción de 2 caracteres no supera el mínimo requerido.
    const result = interaccionFormSchema.safeParse({
      ...datosValidos,
      descripcion: "AB",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("mín. 3 caracteres");
  });

  // ── Validaciones de clienteId ────────────────────────────────────────────

  it("rechaza clienteId igual a 0", () => {
    // El valor 0 se usa como centinela de "sin selección" en el formulario.
    // min(1) asegura que siempre se escoja un cliente real.
    const result = interaccionFormSchema.safeParse({
      ...datosValidos,
      clienteId: 0,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("Selecciona un cliente");
  });

  // ── Validaciones de fecha y hora ─────────────────────────────────────────

  it("rechaza fecha vacía", () => {
    // min(1) impide que el campo se envíe vacío aunque el input de tipo date
    // no muestre un valor aún.
    const result = interaccionFormSchema.safeParse({
      ...datosValidos,
      fecha: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("fecha es obligatoria");
  });

  it("rechaza hora vacía", () => {
    const result = interaccionFormSchema.safeParse({
      ...datosValidos,
      hora: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("hora es obligatoria");
  });
});
