// import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { MessageSquare, Users, NotebookText, Mic, MicOff } from "lucide-react";

// --- Validación con Zod ---
const schema = z.object({
  tipo: z.enum(["consulta", "reunion", "antecedente"]),
  descripcion: z
    .string()
    .min(3, { message: "La descripción es obligatoria (mín. 3 caracteres)." }),
  cliente: z
    .string()
    .min(2, { message: "El cliente es obligatorio (mín. 2 caracteres)." }),
  fecha: z.string().min(1, { message: "La fecha es obligatoria." }),
  hora: z.string().min(1, { message: "La hora es obligatoria." }),
});

type FormValues = z.infer<typeof schema>;

type NuevaInteraccionFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  onCreate?: (data: FormValues) => Promise<void> | void;
};

// Helpers para defaults (hoy, ahora)
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
}: NuevaInteraccionFormProps) {
  const now = new Date();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: "consulta",
      descripcion: "",
      cliente: "",
      fecha: formatDate(now),
      hora: formatTime(now),
    },
  });

  // Para el botón de voz (opcional)
  //   const [isRecording, setIsRecording] = useState(false);
  //   const recognitionRef = useRef<any>(null);

  const currentTipo = watch("tipo");
  //   const currentDescripcion = watch("descripcion");

  //   const startVoice = () => {
  //     if (typeof window === "undefined") return;

  //     const SpeechRecognition =
  //       (window as any).SpeechRecognition ||
  //       (window as any).webkitSpeechRecognition;

  //     if (!SpeechRecognition) {
  //       alert("Reconocimiento de voz no soportado en este navegador.");
  //       return;
  //     }

  //     const recognition = new SpeechRecognition();
  //     recognition.lang = "es-ES";
  //     recognition.continuous = false;
  //     recognition.interimResults = false;

  //     recognition.onstart = () => setIsRecording(true);
  //     recognition.onend = () => setIsRecording(false);
  //     recognition.onerror = () => setIsRecording(false);

  //     recognition.onresult = (event: any) => {
  //       const transcript = event.results[0][0].transcript;
  //       const merged =
  //         (currentDescripcion ? currentDescripcion + " " : "") + transcript;
  //       setValue("descripcion", merged, {
  //         shouldValidate: true,
  //         shouldDirty: true,
  //       });
  //     };

  //     recognitionRef.current = recognition;
  //     recognition.start();
  //   };

  //   const stopVoice = () => {
  //     recognitionRef.current?.stop?.();
  //     setIsRecording(false);
  //   };

  const handleTipoClick = (tipo: FormValues["tipo"]) => {
    setValue("tipo", tipo, { shouldValidate: true });
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Si te pasan onCreate, úsalo para guardar en backend; si no, simula.
      if (onCreate) {
        await onCreate(data);
      } else {
        // Simulación de guardado
        await new Promise((r) => setTimeout(r, 400));
        console.log("Nueva interacción guardada:", data);
      }

      // Reset y cerrar
      reset({
        tipo: "consulta",
        descripcion: "",
        cliente: "",
        fecha: formatDate(new Date()),
        hora: formatTime(new Date()),
      });

      onSuccess?.();
    } catch (e) {
      console.error("Error guardando la interacción:", e);
      // Aquí podrías mostrar un toast de error si usas sonner/toast de shadcn
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <form className="space-y-4 pt-2" onSubmit={handleSubmit(onSubmit)}>
        {/* Tipo de Interacción (botonera/segmentado) */}
        <div className="space-y-2">
          <Label>Tipo de Interacción</Label>
          <div className=" w-full justify-center inline-flex gap-2 rounded-lg bg-muted p-1">
            <Button
              type="button"
              variant={
                currentTipo === "consulta" ? "consultaLilac" : "secondary"
              }
              onClick={() => handleTipoClick("consulta")}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Consulta
            </Button>
            <Button
              type="button"
              variant={currentTipo === "reunion" ? "reunionGreen" : "secondary"}
              onClick={() => handleTipoClick("reunion")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
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
              className="gap-2"
            >
              <NotebookText className="h-4 w-4" />
              Antecedente
            </Button>
          </div>
          {errors.tipo && (
            <p className="text-sm text-destructive">{errors.tipo.message}</p>
          )}
        </div>

        {/* Descripción + mic */}
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <div className="relative">
            <Textarea
              id="descripcion"
              placeholder="ej: Reunión con Guillermo Cervantes el jueves a las 9:00 a.m"
              {...register("descripcion")}
              className="min-h-[110px] pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              // aria-label={isRecording ? "Detener dictado" : "Iniciar dictado"}
              // onClick={isRecording ? stopVoice : startVoice}
              className="absolute right-2 top-2 h-8 w-8"
              title="Dictado por voz"
            >
              {/* {isRecording ? (
              <MicOff className="h-4 w-4 text-red-600" />
            ) : (
              <Mic className="h-4 w-4 text-muted-foreground" />
            )} */}
              <Mic className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          {errors.descripcion && (
            <p className="text-sm text-destructive">
              {errors.descripcion.message}
            </p>
          )}
        </div>

        {/* Cliente (texto libre por ahora) */}
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente</Label>
          <Input
            id="cliente"
            placeholder="ej: Marta García"
            {...register("cliente")}
          />
          {errors.cliente && (
            <p className="text-sm text-destructive">{errors.cliente.message}</p>
          )}
        </div>

        {/* Fecha y hora (inputs nativos, rápidos para móvil) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" type="date" {...register("fecha")} />
            {errors.fecha && (
              <p className="text-sm text-destructive">{errors.fecha.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="hora">Hora</Label>
            <Input id="hora" type="time" {...register("hora")} />
            {errors.hora && (
              <p className="text-sm text-destructive">{errors.hora.message}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onCancel?.();
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primaryBlue" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
