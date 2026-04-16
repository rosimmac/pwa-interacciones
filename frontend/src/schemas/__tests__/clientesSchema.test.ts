/**
 * Tests unitarios de clientesSchema.
 *
 * El esquema solo define el campo `nombre` con límites de longitud
 * (1–50 caracteres). Los tests incluyen pruebas de valor límite para
 * verificar que los extremos del rango se comportan correctamente.
 */

import { describe, it, expect } from "vitest";
import { clientesSchema } from "../clientesSchema";

describe("clientesSchema", () => {
  // ── Caso feliz ───────────────────────────────────────────────────────────

  it("acepta nombre válido", () => {
    const result = clientesSchema.safeParse({ nombre: "Acme Corp" });
    expect(result.success).toBe(true);
  });

  // ── Validaciones de nombre ───────────────────────────────────────────────

  it("rechaza nombre vacío", () => {
    // min(1) impide que se cree un cliente sin identificador visible.
    const result = clientesSchema.safeParse({ nombre: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("obligatorio");
  });

  it("acepta nombre exactamente en el límite de 50 caracteres", () => {
    // Test de valor límite superior inclusivo: 50 caracteres debe ser válido.
    const result = clientesSchema.safeParse({ nombre: "A".repeat(50) });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre con más de 50 caracteres", () => {
    // max(50) evita truncados silenciosos al persistir en base de datos.
    const result = clientesSchema.safeParse({ nombre: "A".repeat(51) });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("50 caracteres");
  });
});
