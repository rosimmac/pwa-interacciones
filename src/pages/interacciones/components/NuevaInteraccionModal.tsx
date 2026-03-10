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
};

/**
 * Modal responsivo:
 * - Móvil (ancho < 768px): Sheet desde abajo (bottom sheet)
 * - Desktop (ancho >= 768px): Dialog centrado y estrecho
 */
export function NuevaInteraccionModal({ open, onOpenChange }: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    // Modal centrado para escritorio
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Interacción</DialogTitle>
            <DialogDescription>
              Rellena los datos para registrar una nueva interacción
            </DialogDescription>
          </DialogHeader>

          <div className="max-w-md mx-auto w-full py-2">
            <NuevaInteraccionForm onSuccess={() => onOpenChange(false)} />
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
          <SheetTitle>Nueva Interacción</SheetTitle>

          <SheetDescription aria-hidden="true">
            Modal para registrar una nueva interacción
          </SheetDescription>
        </SheetHeader>

        {/* El contenido sí lo estrechamos y centramos */}
        <div className="max-w-md mx-auto w-full py-6 px-4">
          <NuevaInteraccionForm onSuccess={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
``;
