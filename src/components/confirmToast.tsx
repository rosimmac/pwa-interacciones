import { toast } from "sonner";

export function confirmDeleteToast(
  mensaje = "¿Seguro que deseas eliminar el cliente?",
  descripcion = "Si lo eliminas, no lo podrás recuperar",
): Promise<boolean> {
  return new Promise((resolve) => {
    const id = toast.custom(
      (t) => (
        <div className="w-full max-w-[560px] rounded-xl border shadow-lg bg-white dark:bg-neutral-900 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-6 w-6 rounded-full bg-red-100 text-red-600 grid place-items-center">
              {/* ícono simple */}
              <span className="text-sm">!</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-600">{mensaje}</div>
              <div className="text-sm text-muted-foreground">{descripcion}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(false);
              }}
              className="px-3 py-2 rounded-md bg-muted text-foreground hover:bg-muted/80"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(true);
              }}
              className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-600/90"
            >
              Eliminar
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // hasta que el usuario decida
        position: "bottom-center",
      },
    );
  });
}
