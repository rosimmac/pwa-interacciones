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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCrear?: (data: any) => Promise<void>;
};

export function NuevaInteraccionModal({ open, onOpenChange, onCrear }: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const formContent = (
    <NuevaInteraccionForm
      onSuccess={() => onOpenChange(false)}
      onCreate={onCrear}
    />
  );

  return (
    <>
      <Dialog open={open && isDesktop} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Interacción</DialogTitle>
            <DialogDescription className="sr-only">
              Rellena los datos para registrar una nueva interacción
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
            <SheetTitle>Nueva Interacción</SheetTitle>
            <SheetDescription className="sr-only">
              Modal para registrar una nueva interacción
            </SheetDescription>
          </SheetHeader>
          <div className="max-w-md mx-auto w-full py-6 px-4">{formContent}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
