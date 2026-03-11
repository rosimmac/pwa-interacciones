import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { NuevoClienteForm } from "./NuevoClienteForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Opcional: si también editas desde este modal
  clienteToEdit?: { id: number; nombre: string } | null;
};

/**
 * Modal responsivo:
 * - Móvil (ancho < 768px): Sheet desde abajo (bottom sheet)
 * - Desktop (ancho >= 768px): Dialog centrado y estrecho
 */
export function NuevoClienteModal({
  open,
  onOpenChange,
  clienteToEdit,
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    // Modal centrado para escritorio
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {clienteToEdit ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {clienteToEdit
                ? "Modifica el nombre del cliente y guarda los cambios"
                : "Rellena el nombre para registrar un nuevo cliente"}
            </DialogDescription>
          </DialogHeader>

          <div className="max-w-md mx-auto w-full py-2">
            <NuevoClienteForm
              clienteToEdit={clienteToEdit ?? null}
              onSuccess={() => onOpenChange(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Sheet móvil (ocupa ancho completo por diseño)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] rounded-t-xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>
            {clienteToEdit ? "Editar Cliente" : "Nuevo Cliente"}
          </SheetTitle>

          <SheetDescription className="sr-only">
            {clienteToEdit
              ? "Hoja para editar un cliente existente"
              : "Hoja para registrar un nuevo cliente"}
          </SheetDescription>
        </SheetHeader>

        <div className="max-w-md mx-auto w-full py-6 px-4">
          <NuevoClienteForm
            clienteToEdit={clienteToEdit ?? null}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
