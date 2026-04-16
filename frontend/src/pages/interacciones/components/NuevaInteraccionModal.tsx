/**
 * Modal responsivo para crear o editar una interacción.
 *
 * Estrategia de layout adaptativo:
 *   - Móvil (< 768 px): `Sheet` deslizante desde abajo con altura máxima del 90 % de la ventana.
 *   - Desktop (≥ 768 px): `Dialog` centrado con ancho máximo de 512 px.
 *
 * Ambos contenedores renderizan el mismo `NuevaInteraccionForm` mediante
 * la función `renderForm()`, evitando duplicar la lógica del formulario.
 *
 * Cuando `interaccionToEdit` tiene valor, el modal entra en modo edición:
 *   - El título cambia a "Editar Interacción".
 *   - `handleUpdate` envuelve `onUpdate` para inyectar automáticamente el `id`.
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
import { NuevaInteraccionForm } from "./NuevaInteraccionForm";
import type { Interaccion } from "@/api/api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si se pasa, el modal entra en modo edición con los datos prefijados. */
  interaccionToEdit?: Interaccion | null;
  /** Callback invocado al guardar una nueva interacción. */
  onCreate?: (data: any) => Promise<void>;
  /** Callback invocado al guardar los cambios de una interacción existente. */
  onUpdate?: (id: number, data: any) => Promise<void>;
};

export function NuevaInteraccionModal({
  open,
  onOpenChange,
  interaccionToEdit,
  onCreate,
  onUpdate,
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isEditing = !!interaccionToEdit;
  const title = isEditing ? "Editar Interacción" : "Nueva Interacción";

  // Envuelve `onUpdate` para inyectar el id de la interacción bajo edición.
  const handleUpdate =
    onUpdate && interaccionToEdit
      ? (data: any) => onUpdate(interaccionToEdit.id, data)
      : undefined;

  /** Formulario compartido por Sheet y Dialog. */
  const renderForm = () => (
    <NuevaInteraccionForm
      open={open}
      onSuccess={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
      onCreate={onCreate}
      onUpdate={handleUpdate}
      interaccionToEdit={interaccionToEdit}
    />
  );

  return (
    <>
      {/* Versión escritorio: Dialog centrado */}
      <Dialog open={open && isDesktop} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {/* Descripción solo para lectores de pantalla (accesibilidad) */}
            <DialogDescription className="sr-only">
              {isEditing
                ? "Edita los datos de la interacción"
                : "Rellena los datos para registrar una nueva interacción"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-w-md mx-auto w-full py-2">{renderForm()}</div>
        </DialogContent>
      </Dialog>

      {/* Versión móvil: Sheet deslizante desde abajo */}
      <Sheet open={open && !isDesktop} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[90vh] rounded-t-xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription className="sr-only">
              {isEditing
                ? "Modal para editar una interacción"
                : "Modal para registrar una nueva interacción"}
            </SheetDescription>
          </SheetHeader>
          <div className="max-w-md mx-auto w-full pt-1 pb-6 px-4">
            {renderForm()}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
