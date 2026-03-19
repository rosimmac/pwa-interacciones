// src/components/VoiceRecorder.tsx
import { useEffect } from "react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mic, Square, CheckCircle2, AlertTriangle } from "lucide-react";

type VoiceRecorderProps = {
  onAppendText: (text: string) => void; // función para volcar el texto reconocido en tu textarea/campo
  lang?: string; // 'es-ES' por defecto
};

export default function VoiceRecorder({
  onAppendText,
  lang = "es-ES",
}: VoiceRecorderProps) {
  const {
    supported,
    listening,
    transcript,
    finalTranscript,
    error,
    start,
    stop,
    reset,
  } = useSpeechToText({ lang, continuous: false, interimResults: true });

  // Notificar errores con Sonner
  useEffect(() => {
    if (error) {
      toast.error("Error de voz", {
        description:
          error === "not-allowed"
            ? "Permiso de micrófono denegado. Revisa los ajustes del navegador."
            : error === "no-speech"
              ? "No se detectó voz. Intenta hablar más cerca del micrófono."
              : "Ha ocurrido un problema con el reconocimiento de voz.",
      });
    }
  }, [error]);

  // Cuando hay finalTranscript, lo volcamos y reseteamos para próximas capturas cortas
  useEffect(() => {
    if (finalTranscript) {
      onAppendText(finalTranscript.trim());
      toast.success("Dictado añadido", {
        description: "Se insertó el texto reconocido.",
      });
      reset();
    }
  }, [finalTranscript, onAppendText, reset]);

  if (!supported) {
    return (
      <div className="text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-500" />
          <span>
            El dictado por voz no es compatible en este navegador. Prueba con
            Chrome/Edge en escritorio o revisa iOS (requiere{" "}
            <code>webkitSpeechRecognition</code>).
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {!listening ? (
          <Button
            type="button"
            variant="secondary"
            onClick={start}
            aria-label="Comenzar dictado"
          >
            <Mic className="size-4 mr-2" />
            Dictar
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            onClick={stop}
            aria-label="Detener dictado"
          >
            <Square className="size-4 mr-2" />
            Detener
          </Button>
        )}

        <Badge variant={listening ? "default" : "secondary"}>
          {listening ? "Escuchando..." : "Listo"}
        </Badge>
      </div>

      {/* Muestra el texto interino mientras se habla */}
      {listening && transcript && (
        <div className="text-sm text-muted-foreground italic line-clamp-2">
          {transcript}
        </div>
      )}

      {/* Feedback visual de éxito/estado */}
      {!listening && !transcript && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span>
            Toque “Dictar”, hable y luego “Detener” para insertar el texto.
          </span>
        </div>
      )}
    </div>
  );
}
