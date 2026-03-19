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
  interaccionToEdit?: Interaccion | null;
  onCreate?: (data: any) => Promise<void>;
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

  const handleUpdate =
    onUpdate && interaccionToEdit
      ? (data: any) => onUpdate(interaccionToEdit.id, data)
      : undefined;

  const formContent = (
    <NuevaInteraccionForm
      onSuccess={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
      onCreate={onCreate}
      onUpdate={handleUpdate}
      interaccionToEdit={interaccionToEdit}
    />
  );

  return (
    <>
      <Dialog open={open && isDesktop} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">
              {isEditing
                ? "Edita los datos de la interacción"
                : "Rellena los datos para registrar una nueva interacción"}
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
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription className="sr-only">
              {isEditing
                ? "Modal para editar una interacción"
                : "Modal para registrar una nueva interacción"}
            </SheetDescription>
          </SheetHeader>
          <div className="max-w-md mx-auto w-full pt-1 pb-6 px-4">
            {formContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
