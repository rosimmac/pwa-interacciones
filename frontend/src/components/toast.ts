/**
 * Colección centralizada de toasts de feedback para cada entidad del dominio.
 *
 * Cada objeto agrupa los mensajes de éxito y error de las operaciones CRUD
 * de una entidad (clientes, interacciones, usuarios…). Esta centralización
 * evita cadenas de texto dispersas por los componentes y facilita cambiarlas
 * desde un único punto.
 *
 * Todos los toasts de éxito comparten el mismo estilo verde (`successStyle`).
 * Los toasts de error delegan en `errorToast`, que incluye opcionalmente un
 * botón "Reintentar" cuando se pasa el callback `onRetry`.
 */

import { toast } from "sonner";
import { errorToast } from "./ErrorToast";

/** Estilos comunes para todos los toasts de operación exitosa. */
const successStyle = {
  background: "#16a34a",
  color: "white",
  border: "none",
};

/** Botón de cierre manual del toast (etiqueta "✕"). */
const closeButton = { label: "✕", onClick: () => {} };

/** Estilos del botón de cierre superpuesto al toast. */
const cancelButtonStyle = {
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: "1rem",
};

// ── Clientes ─────────────────────────────────────────────────────────────────

export const toastCliente = {
  okGuardado: () =>
    toast.success("Cliente guardado correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  okActualizado: () =>
    toast.success("Cliente actualizado correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  okEliminado: () =>
    toast.success("Cliente eliminado correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  /** Muestra un error de guardado con botón de reintento opcional. */
  errorGuardar: (onRetry?: () => void) =>
    errorToast(
      "Error al guardar el cliente.",
      "Problema de conexión. Inténtalo de nuevo.",
      onRetry,
    ),
  errorActualizar: (onRetry?: () => void) =>
    errorToast(
      "Error al actualizar el cliente.",
      "Problema de conexión. Inténtalo de nuevo.",
      onRetry,
    ),
  errorEliminar: (onRetry?: () => void) =>
    errorToast(
      "No se pudo eliminar el cliente.",
      "Problema de conexión. Inténtalo de nuevo.",
      onRetry,
    ),
};

// ── Interacciones ─────────────────────────────────────────────────────────────

export const toastInteraccion = {
  okGuardado: () =>
    toast.success("Interacción guardada correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  okActualizado: () =>
    toast.success("Interacción actualizada correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  okEliminado: () =>
    toast.success("Interacción eliminada correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  errorGuardar: (onRetry?: () => void) =>
    errorToast(
      "Error al guardar la interacción.",
      "Problema de conexión. Inténtalo de nuevo.",
      onRetry,
    ),
  errorActualizar: (onRetry?: () => void) =>
    errorToast(
      "Error al actualizar la interacción.",
      "Problema de conexión. Inténtalo de nuevo.",
      onRetry,
    ),
  errorEliminar: (onRetry?: () => void) =>
    errorToast(
      "No se pudo eliminar la interacción.",
      "Problema de conexión. Inténtalo de nuevo.",
      onRetry,
    ),
};

// ── Registro de cuenta ────────────────────────────────────────────────────────

export const toastRegistro = {
  okGuardado: () =>
    toast.success("Cuenta creada correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  errorRegistro: () =>
    errorToast(
      "Error en el registro",
      "El usuario no ha podido ser registrado",
    ),
};

// ── Dictado por voz ───────────────────────────────────────────────────────────

export const toastVoz = {
  okDictado: () =>
    toast.success("Texto añadido desde dictado", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  /** `denegado` determina si el micrófono fue bloqueado por el usuario. */
  errorMicrofono: (denegado: boolean) =>
    errorToast(
      "Error de voz",
      denegado ? "Permiso de micrófono denegado" : "No se pudo procesar la voz",
    ),
  errorNoSoportado: () =>
    errorToast(
      "Dictado no disponible",
      "El dictado por voz no es compatible con este navegador",
    ),
};

// ── Autenticación ─────────────────────────────────────────────────────────────

export const toastAuth = {
  okCerrarSesion: () =>
    toast.success("Sesión cerrada correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
};

// ── Usuarios ──────────────────────────────────────────────────────────────────

export const toastUsuario = {
  okGuardado: () =>
    toast.success("Usuario guardado correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  okActualizado: () =>
    toast.success("Usuario actualizado correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  okEliminado: () =>
    toast.success("Usuario eliminado correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  errorGuardar: (onRetry?: () => void) =>
    errorToast(
      "Error al guardar el usuario.",
      "Problema de conexión. Inténtalo de nuevo.",
      onRetry,
    ),
  errorActualizar: (onRetry?: () => void) =>
    errorToast(
      "Error al actualizar el usuario.",
      "Problema de conexión. Inténtalo de nuevo.",
      onRetry,
    ),
  errorEliminar: (onRetry?: () => void) =>
    errorToast(
      "No se pudo eliminar el usuario.",
      "Problema de conexión. Inténtalo de nuevo.",
      onRetry,
    ),
};

// ── Recuperación de contraseña ────────────────────────────────────────────────

export const toastRecuperacion = {
  okEnviado: () =>
    toast.success("Enlace enviado correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  okRestablecido: () =>
    toast.success("Contraseña actualizada correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
  /** Se muestra cuando el token del enlace de recuperación ha expirado o es inválido. */
  errorEnlace: () =>
    errorToast(
      "Enlace inválido o caducado",
      "Solicita un nuevo enlace de recuperación.",
    ),
};
