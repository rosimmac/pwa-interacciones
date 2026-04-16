/**
 * Componente Label basado en Radix UI `Label` primitive.
 *
 * Extiende el `<label>` nativo con gestión automática del cursor y opacidad
 * cuando el input asociado está deshabilitado, utilizando las clases
 * `peer-disabled` de Tailwind para aplicar estilos sin JS extra.
 */

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
