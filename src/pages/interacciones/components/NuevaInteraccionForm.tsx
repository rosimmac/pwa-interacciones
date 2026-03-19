import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSpeechToText } from "@/hooks/useSpeechToText";

import { Mic } from "lucide-react";
import { api, type Interaccion, type Cliente } from "@/api/api";
import {
  interaccionFormSchema,
  type interaccionFormData,
} from "@/schemas/interaccionFormSchema";

type NuevaInteraccionFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  onCreate?: (data: interaccionFormData) => Promise<void> | void;
  onUpdate?: (data: interaccionFormData) => Promise<void> | void;
  interaccionToEdit?: Interaccion | null;
};

function formatDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatTime(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
}

export function NuevaInteraccionForm({
  onSuccess,
  onCancel,
  onCreate,
  onUpdate,
  interaccionToEdit,
}: NuevaInteraccionFormProps) {
  const isEditing = !!interaccionToEdit;
  const now = new Date();

  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    api.getClientes().then(setClientes).catch(console.error);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<interaccionFormData>({
    resolver: zodResolver(interaccionFormSchema),
    defaultValues: {
      tipo: "reunion",
      descripcion: "",
      clienteId: undefined,
      fecha: formatDate(now),
      hora: formatTime(now),
    },
  });

  useEffect(() => {
    if (interaccionToEdit) {
      const fecha = new Date(interaccionToEdit.fecha);
      reset({
        tipo: interaccionToEdit.tipo,
        descripcion: interaccionToEdit.descripcion,
        clienteId: interaccionToEdit.clienteId,
        fecha: formatDate(fecha),
        hora: formatTime(fecha),
      });
    } else {
      const n = new Date();
      reset({
        tipo: "reunion",
        descripcion: "",
        clienteId: undefined,
        fecha: formatDate(n),
        hora: formatTime(n),
      });
    }
  }, [interaccionToEdit, reset]);

  const currentTipo = watch("tipo");
  const currentClienteId = watch("clienteId");

  // --- Dictado por voz ---
  const {
    supported,
    listening,
    transcript,
    finalTranscript,
    error,
    start,
    stop,
    reset: resetVoice,
  } = useSpeechToText({
    lang: "es-ES",
    continuous: false,
    interimResults: true,
  });

  useEffect(() => {
    if (finalTranscript) {
      const prev = watch("descripcion") || "";
      const sep = prev && !prev.endsWith(" ") ? " " : "";
      setValue("descripcion", `${prev}${sep}${finalTranscript}`, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success("Texto añadido desde dictado");
      resetVoice();
    }
  }, [finalTranscript, resetVoice, setValue, watch]);

  useEffect(() => {
    if (error) {
      toast.error("Error de voz", {
        description:
          error === "not-allowed"
            ? "Permiso de micrófono denegado"
            : "No se pudo procesar la voz",
      });
    }
  }, [error]);

  const handleTipoClick = (tipo: interaccionFormData["tipo"]) => {
    setValue("tipo", tipo, { shouldValidate: true });
  };

  const onSubmit = async (data: interaccionFormData) => {
    try {
      if (isEditing && onUpdate) {
        await onUpdate(data);
      } else if (onCreate) {
        await onCreate(data);
      }

      reset({
        tipo: "reunion",
        descripcion: "",
        clienteId: undefined,
        fecha: formatDate(new Date()),
        hora: formatTime(new Date()),
      });

      onSuccess?.();
    } catch (e) {
      console.error("Error guardando la interacción:", e);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <form className="space-y-4 pt-2" onSubmit={handleSubmit(onSubmit)}>
        {/* Tipo de Interacción */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Tipo de Interacción</Label>
          <div className="flex w-full rounded-lg bg-muted p-1 gap-1">
            <Button
              type="button"
              variant={
                currentTipo === "consulta" ? "consultaLilac" : "secondary"
              }
              onClick={() => handleTipoClick("consulta")}
              className="flex-1 text-sm px-2 py-1 h-8"
            >
              Consulta
            </Button>
            <Button
              type="button"
              variant={currentTipo === "reunion" ? "reunionGreen" : "secondary"}
              onClick={() => handleTipoClick("reunion")}
              className="flex-1 text-sm px-2 py-1 h-8"
            >
              Reunión
            </Button>
            <Button
              type="button"
              variant={
                currentTipo === "antecedente"
                  ? "antecedenteOrange"
                  : "secondary"
              }
              onClick={() => handleTipoClick("antecedente")}
              className="flex-1 text-sm px-2 py-1 h-8"
            >
              Antecedente
            </Button>
          </div>
          {errors.tipo && (
            <p className="text-sm text-destructive">{errors.tipo.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="descripcion" className="text-muted-foreground">
            Descripción
          </Label>
          <div className="relative">
            <Textarea
              id="descripcion"
              placeholder="ej: Reunión con Guillermo Cervantes el jueves a las 9:00 a.m"
              {...register("descripcion")}
              className="min-h-[110px] pr-12 pb-10"
            />

            {listening && (
              <p className="text-xs text-muted-foreground italic">
                Escuchando… habla ahora
              </p>
            )}

            {transcript && listening && (
              <p className="text-xs text-muted-foreground italic line-clamp-2">
                {transcript}
              </p>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8"
              title="Dictado por voz"
              onClick={() => {
                if (!supported) {
                  toast.error("El dictado no es compatible en este navegador");
                  return;
                }
                listening ? stop() : start();
              }}
            >
              <Mic
                className={`h-4 w-4 ${
                  listening ? "text-red-500" : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>
          {errors.descripcion && (
            <p className="text-sm text-destructive">
              {errors.descripcion.message}
            </p>
          )}
        </div>

        {/* Cliente (selector ancho completo) */}
        <div className="space-y-2">
          <Label htmlFor="clienteId" className="text-muted-foreground">
            Cliente
          </Label>
          <Select
            value={currentClienteId ? String(currentClienteId) : ""}
            onValueChange={(val) =>
              setValue("clienteId", Number(val), { shouldValidate: true })
            }
          >
            <SelectTrigger id="clienteId" className="w-full">
              <SelectValue placeholder="Selecciona un cliente…" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clienteId && (
            <p className="text-sm text-destructive">
              {errors.clienteId.message}
            </p>
          )}
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fecha" className="text-muted-foreground">
              Fecha
            </Label>
            <Input id="fecha" type="date" {...register("fecha")} />
            {errors.fecha && (
              <p className="text-sm text-destructive">{errors.fecha.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="hora" className="text-muted-foreground">
              Hora
            </Label>
            <Input id="hora" type="time" {...register("hora")} />
            {errors.hora && (
              <p className="text-sm text-destructive">{errors.hora.message}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onCancel?.()}>
            Cancelar
          </Button>
          <Button type="submit" variant="primaryBlue" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando…"
              : isEditing
                ? "Guardar cambios"
                : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
