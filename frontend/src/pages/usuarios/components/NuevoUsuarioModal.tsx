/**
 * Modal responsivo para crear o editar un usuario del sistema.
 *
 * Idéntico en estructura a `NuevoClienteModal` y `NuevaInteraccionModal`:
 *   - Móvil (< 768 px): `Sheet` deslizante desde abajo.
 *   - Desktop (≥ 768 px): `Dialog` centrado.
 *
 * La prop `key` de `NuevoUsuarioForm` fuerza un desmontaje y remontaje
 * del formulario cuando cambia el usuario editado, garantizando que los
 * `useEffect` de reset de campos se ejecuten correctamente.
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
import { NuevoUsuarioForm } from "./NuevoUsuarioForm";
import type { UsuarioFormData } from "@/schemas/usuarioSchema";
import type { Usuario } from "@/api/api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si se pasa, el modal entra en modo edición con los datos del usuario. */
  usuarioToEdit?: Usuario | null;
  /** Callback invocado al guardar un nuevo usuario. */
  onCreate: (data: UsuarioFormData) => Promise<void>;
  /** Callback invocado al guardar los cambios de un usuario existente. */
  onUpdate: (id: number, data: UsuarioFormData) => Promise<void>;
};

export function NuevoUsuarioModal({
  open,
  onOpenChange,
  usuarioToEdit,
  onCreate,
  onUpdate,
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const titulo = usuarioToEdit ? "Editar Usuario" : "Nuevo Usuario";
  const descripcion = usuarioToEdit
    ? "Modifica los datos del usuario y guarda los cambios"
    : "Rellena los datos para registrar un nuevo usuario";

  /**
   * La `key` basada en el id del usuario editado (o "nuevo") garantiza que
   * React desmonte y vuelva a montar el formulario cuando cambia el usuario
   * seleccionado, forzando el reset de todos los campos.
   */
  const renderForm = () => (
    <NuevoUsuarioForm
      key={usuarioToEdit?.id ?? "nuevo"}
      open={open}
      usuarioToEdit={usuarioToEdit ?? null}
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
            <DialogDescription className="sr-only">
              {descripcion}
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
            <SheetTitle>{titulo}</SheetTitle>
            <SheetDescription className="sr-only">
              {descripcion}
            </SheetDescription>
          </SheetHeader>
          <div className="max-w-md mx-auto w-full pt-2 pb-6 px-4">
            {renderForm()}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
