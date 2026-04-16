/**
 * Utilidades de estilo compartidas por toda la aplicación.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases CSS condicionales y resuelve conflictos de Tailwind.
 *
 * Usa `clsx` para procesar arrays, objetos y condiciones booleanas,
 * y después `tailwind-merge` para eliminar clases redundantes o en
 * conflicto (p. ej., `p-2 p-4` → `p-4`).
 *
 * @example
 * cn("px-4", isActive && "bg-blue-500", "px-2") // → "bg-blue-500 px-2"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
