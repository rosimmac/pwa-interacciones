/**
 * Toast de confirmación de eliminación.
 *
 * Muestra un aviso visual de peligro con dos botones ("Cancelar" / "Eliminar")
 * y devuelve una promesa que se resuelve con `true` si el usuario confirma
 * o con `false` si cancela.
 *
 * La promesa se resuelve en el handler de cada botón, que también descarta
 * el toast. `duration: Infinity` evita que el toast se cierre solo antes de
 * que el usuario tome una decisión.
 *
 * Uso:
 * ```ts
 * const confirmar = await confirmDeleteToast("¿Eliminar este registro?");
 * if (confirmar) { ... }
 * ```
 */

import { toast } from "sonner";

export function confirmDeleteToast(
  mensaje = "¿Seguro que deseas eliminar?",
  descripcion = "Si lo eliminas, no lo podrás recuperar",
): Promise<boolean> {
  return new Promise((resolve) => {
    // `id` se usa para descartar el toast manualmente desde los botones.
    const id = toast.custom(
      () => (
        <div
          style={{
            width: "100%",
            maxWidth: "360px",
            background: "#FCEBEB",
            borderRadius: "12px",
            border: "0.5px solid #F09595",
            padding: "1.25rem 1.25rem 1rem",
          }}
        >
          {/* Icono + textos */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            {/* Círculo rojo con icono de advertencia (SVG inline) */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#E24B4A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Z"
                  fill="white"
                />
                <path
                  d="M8 4.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5ZM8 10a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"
                  fill="white"
                />
              </svg>
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 3px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#A32D2D",
                }}
              >
                {mensaje}
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "#E24B4A" }}>
                {descripcion}
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div
            style={{ display: "flex", gap: "8px", justifyContent: "center" }}
          >
            {/* Cancelar: cierra el toast y resuelve con false */}
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(false);
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "8px",
                background: "white",
                color: "#A32D2D",
                border: "0.5px solid #F09595",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            {/* Confirmar: cierra el toast y resuelve con true */}
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(true);
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "8px",
                background: "#E24B4A",
                color: "white",
                border: "none",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      ),
      // `Infinity` previene el cierre automático del toast antes de la decisión.
      { duration: Infinity, position: "bottom-center" },
    );
  });
}
