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
};
