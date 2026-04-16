/**
 * Botón de acción flotante (FAB – Floating Action Button).
 *
 * Se posiciona en la esquina inferior derecha mediante `position: fixed`
 * y dispara la acción primaria de la pantalla actual (habitualmente,
 * abrir el modal de creación).
 */

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type BotonFlotanteProps = {
  /** Función que se ejecuta al hacer clic sobre el botón. */
  onClick: () => void;
};

export function BotonFlotante({ onClick }: BotonFlotanteProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed bottom-6 right-6 bg-blue-600 text-white h-16 w-16 rounded-full shadow-xl"
    >
      {/* Icono de suma con tamaño aumentado para mejor usabilidad táctil */}
      <Plus className="!h-9 !w-9" />
    </Button>
  );
}
