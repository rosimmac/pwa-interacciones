import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Pencil } from "lucide-react";
import React from "react";

interface InteraccionCardProps {
  tipo: string;
  titulo: string;
  usuario: string;
  fecha: string;
  icono: React.ReactNode;
  /** Usa "green" | "purple" | "orange" */
  color: "green" | "purple" | "orange";
}

type ColorConfig = {
  iconBg: string; // Fondo del contenedor del icono
  badgeBg: string; // Fondo suave de la etiqueta
  text: string; // Color de texto y trazo
};

const colorMap: Record<InteraccionCardProps["color"], ColorConfig> = {
  green: {
    iconBg: "bg-green-500",
    badgeBg: "bg-gray-300/20",
    text: "text-green-700",
  },
  purple: {
    iconBg: "bg-purple-500",
    badgeBg: "bg-gray-300/20",
    text: "text-purple-700",
  },
  orange: {
    iconBg: "bg-orange-500",
    badgeBg: "bg-gray-300/20",
    text: "text-orange-700",
  },
};

export function InteraccionCard({
  tipo,
  titulo,
  usuario,
  fecha,
  icono,
  color,
}: InteraccionCardProps) {
  // Tipado explícito: nunca será any
  const c: ColorConfig = colorMap[color];

  return (
    <Card className=" rounded-2xl shadow-sm bg-white border">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start w-full">
          <div className="flex items-start gap-2">
            {/* Icono grande (fondo del color + icono blanco) */}
            <div
              className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-xl ${c.iconBg}`}
            >
              {/* Fuerza tamaño y color del SVG para que siempre se vea */}
              <span className="text-white">
                {/* si icono viene sin clases, lo envolvemos para aplicar text-white */}
                {icono}
              </span>
            </div>

            {/* Tipo (alineado con esquina sup. derecha del icono) */}
            <span
              className={`text-xs font-semibold leading-tight px-2 py-1 rounded-md inline-block ${c.badgeBg} ${c.text}`}
            >
              {tipo.toUpperCase()}
            </span>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-red-500 cursor-pointer" />
            <Pencil className="h-5 w-5 text-gray-500 cursor-pointer" />
          </div>
        </div>
        <div className="px-14">
          {/* Descripción */}
          <p className="text-gray-800 mt-2 text-sm leading-5">{titulo}</p>

          {/* Información inferior */}
          <div className="flex items-center gap-2 mt-3 text-gray-500 text-xs">
            <span>{usuario}</span>
            <span></span>
            <span>{fecha}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
