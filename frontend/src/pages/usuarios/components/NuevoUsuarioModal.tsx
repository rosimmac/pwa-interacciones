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
  usuarioToEdit?: Usuario | null;
  onCreate: (data: UsuarioFormData) => Promise<void>;
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

  const formContent = (
    <NuevoUsuarioForm
      usuarioToEdit={usuarioToEdit ?? null}
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
