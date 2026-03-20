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
import type { ClienteFormData } from "@/schemas/clientesSchema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteToEdit?: { id: number; nombre: string } | null;
  onCreate: (data: ClienteFormData) => Promise<void>;
  onUpdate: (id: number, data: ClienteFormData) => Promise<void>;
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
  onCreate,
  onUpdate,
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const titulo = clienteToEdit ? "Editar Cliente" : "Nuevo Cliente";
  const descripcion = clienteToEdit
    ? "Modifica el nombre del cliente y guarda los cambios"
    : "Rellena el nombre para registrar un nuevo cliente";

  const formContent = (
    <NuevoClienteForm
      clienteToEdit={clienteToEdit ?? null}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onSuccess={() => onOpenChange(false)}
    />
  );

  return (
    <>
      <Dialog open={open && isDesktop} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
            <DialogDescription className="sr-only">
              {descripcion}
            </DialogDescription>
          </DialogHeader>
          <div className="max-w-md mx-auto w-full py-2">{formContent}</div>
        </DialogContent>
      </Dialog>

      <Sheet open={open && !isDesktop} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[90vh] rounded-t-xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>{titulo}</SheetTitle>
            <SheetDescription className="sr-only">
              {descripcion}
            </SheetDescription>
          </SheetHeader>
          <div className="max-w-md mx-auto w-full pt-2 pb-6 px-4">
            {formContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
