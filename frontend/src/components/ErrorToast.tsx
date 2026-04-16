/**
 * Toast de error con opción de reintento.
 *
 * Muestra un aviso visual de error con mensaje, descripción y,
 * opcionalmente, un botón "Reintentar" que ejecuta el callback `onRetry`
 * y cierra el toast. Siempre incluye un botón "Cerrar".
 *
 * Se cierra automáticamente tras 6 segundos (`duration: 6000`).
 * Devuelve el ID del toast para que el llamante pueda descartarlo
 * manualmente si lo necesita.
 *
 * Uso:
 * ```ts
 * errorToast("Error al guardar", "Comprueba tu conexión", () => guardar());
 * ```
 */

import { toast } from "sonner";

export function errorToast(
  mensaje: string,
  descripcion: string,
  /** Callback opcional que se ejecuta al pulsar "Reintentar". */
  onRetry?: () => void,
) {
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
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          {/* Icono de advertencia en círculo rojo */}
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

          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: "0 0 3px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#791F1F",
              }}
            >
              {mensaje}
            </p>
            <p
              style={{ margin: "0 0 12px", fontSize: "13px", color: "#A32D2D" }}
            >
              {descripcion}
            </p>

            {/* Botones: "Reintentar" (condicional) y "Cerrar" */}
            <div
              style={{ display: "flex", gap: "8px", justifyContent: "center" }}
            >
              {/* El botón Reintentar solo aparece si se proporciona el callback. */}
              {onRetry && (
                <button
                  onClick={() => {
                    toast.dismiss(id);
                    onRetry();
                  }}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    borderRadius: "8px",
                    background: "#E24B4A",
                    color: "white",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Reintentar
                </button>
              )}
              <button
                onClick={() => toast.dismiss(id)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: "8px",
                  background: "white",
                  color: "#A32D2D",
                  border: "0.5px solid #F09595",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
    { duration: 6000, position: "bottom-center" },
  );
  return id;
}
