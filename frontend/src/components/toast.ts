import { toast } from "sonner";
import { errorToast } from "./ErrorToast";

const successStyle = {
  background: "#16a34a",
  color: "white",
  border: "none",
};

const closeButton = { label: "✕", onClick: () => {} };
const cancelButtonStyle = {
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: "1rem",
};

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

export const toastVoz = {
  okDictado: () =>
    toast.success("Texto añadido desde dictado", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
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

export const toastAuth = {
  okCerrarSesion: () =>
    toast.success("Sesión cerrada correctamente", {
      style: successStyle,
      cancel: closeButton,
      cancelButtonStyle,
    }),
};

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
  errorEnlace: () =>
    errorToast(
      "Enlace inválido o caducado",
      "Solicita un nuevo enlace de recuperación.",
    ),
};
