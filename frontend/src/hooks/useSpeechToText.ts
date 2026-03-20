// src/hooks/useSpeechToText.ts
// Hook para dictado por voz con Web Speech API (Chrome/Edge y webkit en Safari).
// - Tipado robusto (usa constructores globales declarados en .d.ts).
// - Maneja estados: supported, listening, transcript (interino), finalTranscript (acumulado sesión).
// - API: start(), stop(), reset().
// - Idioma por defecto: 'es-ES'.
//
// Requiere tener los tipos globales en src/types/speech.d.ts (ver nota más abajo).

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechToTextOptions {
  lang?: string; // ej: 'es-ES'
  continuous?: boolean; // seguir escuchando hasta parar manualmente (ojo en iOS)
  interimResults?: boolean; // mostrar texto parcial mientras se habla
  autoStart?: boolean; // intentar iniciar al montar (no recomendado por permisos)
}

interface UseSpeechToText {
  supported: boolean;
  listening: boolean;
  transcript: string; // texto interino de la tanda actual
  finalTranscript: string; // acumulado final de la sesión
  error: string | null; // códigos típicos: 'not-allowed', 'no-speech', 'audio-capture'
  start: () => void;
  stop: () => void;
  reset: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

const getSpeechRecognitionCtor = (): SpeechRecognitionConstructor | null => {
  // Estos valores (SpeechRecognition / webkitSpeechRecognition) se declaran en src/types/speech.d.ts
  if (typeof SpeechRecognition !== "undefined") {
    return SpeechRecognition as unknown as SpeechRecognitionConstructor;
  }
  if (typeof webkitSpeechRecognition !== "undefined") {
    return webkitSpeechRecognition as unknown as SpeechRecognitionConstructor;
  }
  return null;
};

export function useSpeechToText({
  lang = "es-ES",
  continuous = false,
  interimResults = true,
  autoStart = false,
}: UseSpeechToTextOptions = {}): UseSpeechToText {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Inicialización y wiring de eventos
  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();

    if (!Ctor) {
      setSupported(false);
      return;
    }

    setSupported(true);
    const recognition = new Ctor();

    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onerror = (event: any) => {
      // Algunos navegadores ponen event.error con: 'no-speech', 'audio-capture', 'not-allowed', etc.
      setError(event?.error || "speech_error");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      // Si continuous=true, los navegadores pueden cortar sobre 60s; se podría reiniciar aquí si se desea.
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalChunk += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }

      if (interim) setTranscript(interim);
      if (finalChunk) {
        setFinalTranscript((prev) =>
          prev ? `${prev} ${finalChunk}`.trim() : finalChunk.trim(),
        );
        setTranscript(""); // limpiamos el interino cuando llega final
      }
    };

    recognitionRef.current = recognition;

    if (autoStart) {
      try {
        recognition.start(); // puede fallar si no hay gesto del usuario
      } catch {
        /* no-op */
      }
    }

    return () => {
      try {
        recognition.stop();
      } catch {
        /* no-op */
      }
      recognitionRef.current = null;
    };
  }, [lang, continuous, interimResults, autoStart]);

  const start = useCallback(() => {
    setError(null);
    try {
      recognitionRef.current?.start();
    } catch (e: any) {
      // Algunos navegadores lanzan si ya está en ejecución
      setError(e?.message ?? "No se pudo iniciar el reconocimiento");
    }
  }, []);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (e: any) {
      setError(e?.message ?? "No se pudo detener el reconocimiento");
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setFinalTranscript("");
    setError(null);
  }, []);

  return {
    supported,
    listening,
    transcript,
    finalTranscript,
    error,
    start,
    stop,
    reset,
  };
}
