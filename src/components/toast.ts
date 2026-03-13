import { toast } from "sonner";

export const toastCliente = {
  okGuardado: () => toast.success("Cliente guardado correctamente"),
  errorGuardar: (onRetry?: () => void) =>
    toast.error("Error al guardar el cliente.", {
      description: "Problema de conexión. Inténtalo de nuevo.",
      action: onRetry ? { label: "Reintentar", onClick: onRetry } : undefined,
    }),
  errorActualizar: (onRetry?: () => void) =>
    toast.error("Error al actualizar el cliente.", {
      description: "Problema de conexión. Inténtalo de nuevo.",
      action: onRetry ? { label: "Reintentar", onClick: onRetry } : undefined,
    }),
  okEliminado: () => toast.success("Cliente eliminado"),
};
