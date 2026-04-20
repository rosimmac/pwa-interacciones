/**
 * Modal responsivo para crear o editar un cliente.
 *
 * Estrategia de layout adaptativo:
 *   - Móvil (< 768 px): `Sheet` deslizante desde abajo.
 *   - Desktop (≥ 768 px): `Dialog` centrado con ancho máximo de 512 px.
 *
 * El contenido del formulario (`formContent`) se calcula una sola vez y se
 * reutiliza en ambas variantes para evitar duplicidad de código.
 *
 * Cuando `clienteToEdit` tiene valor, el modal entra en modo edición:
 *   - El título cambia a "Editar Cliente".
 *   - `NuevoClienteForm` recibe el cliente a editar para prefill de campos.
 */

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
  /** Si se pasa, el modal entra en modo edición con los datos del cliente. */
  clienteToEdit?: { id: number; nombre: string } | null;
  /** Callback invocado al guardar un nuevo cliente. */
  onCreate: (data: ClienteFormData) => Promise<void>;
  /** Callback invocado al guardar los cambios de un cliente existente. */
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

  // El formulario es idéntico en ambas variantes; se calcula una vez.
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
      {/* Versión escritorio: Dialog centrado */}
      <Dialog open={open && isDesktop} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
            {/* Solo visible para lectores de pantalla */}
            <DialogDescription className="sr-only">
              {descripcion}
            </DialogDescription>
          </DialogHeader>
          <div className="max-w-md mx-auto w-full py-2">{formContent}</div>
        </DialogContent>
      </Dialog>

      {/* Versión móvil: Sheet deslizante desde abajo */}
      <Sheet open={open && !isDesktop} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-xl overflow-y-auto"
          style={{ maxHeight: "90dvh" }}
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
