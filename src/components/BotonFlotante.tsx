import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type BotonFlotanteProps = {
  onClick: () => void;
};

export function BotonFlotante({ onClick }: BotonFlotanteProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed bottom-6 right-6 bg-blue-600 text-white h-16 w-16 rounded-full shadow-xl"
    >
      <Plus className="h-7 w-7" />
    </Button>
  );
}
