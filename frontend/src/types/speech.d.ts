/**
 * Declaraciones de tipos globales para la Web Speech API.
 *
 * La Web Speech API no forma parte del estándar TypeScript (lib.dom.d.ts)
 * en todas sus versiones, por lo que se declara aquí para que el compilador
 * reconozca `SpeechRecognition` y `webkitSpeechRecognition` sin errores.
 *
 * Ambas variables se declaran como `undefined` para reflejar que la API
 * puede no estar disponible en todos los navegadores (p. ej., Firefox o Safari
 * sin el prefijo webkit), obligando a comprobar su existencia en tiempo de
 * ejecución antes de instanciarla.
 */

/** Interfaz principal del reconocedor de voz. */
interface SpeechRecognition extends EventTarget {
  /** Idioma BCP 47 usado para el reconocimiento (p. ej., "es-ES"). */
  lang: string;
  /** Si es `true`, el reconocimiento continúa hasta llamar a `stop()`. */
  continuous: boolean;
  /** Si es `true`, devuelve resultados parciales mientras el usuario habla. */
  interimResults: boolean;
  /** Número máximo de transcripciones alternativas por resultado. */
  maxAlternatives: number;

  /** Inicia la sesión de reconocimiento. */
  start(): void;
  /** Detiene la sesión y devuelve los resultados pendientes. */
  stop(): void;

  /** Se dispara cuando el reconocimiento comienza a escuchar. */
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  /** Se dispara si ocurre un error durante el reconocimiento. */
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  /** Se dispara cuando el reconocimiento termina (por `stop()` o inactividad). */
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  /** Se dispara cuando hay un nuevo resultado de transcripción disponible. */
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
}

/** Evento que encapsula los resultados de una sesión de reconocimiento. */
interface SpeechRecognitionEvent extends Event {
  /** Lista de resultados de transcripción generados hasta el momento. */
  results: SpeechRecognitionResultList;
  /** Índice del primer resultado nuevo en la lista `results`. */
  resultIndex: number;
}

/** Colección de resultados de reconocimiento, indexable numéricamente. */
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

/** Un resultado individual que puede contener varias alternativas. */
interface SpeechRecognitionResult {
  /** `true` si el reconocedor ha finalizado este fragmento de audio. */
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

/** Una transcripción candidata con su nivel de confianza (0–1). */
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

/**
 * Constructor estándar del reconocedor de voz.
 * `undefined` cuando el navegador no soporta la API sin prefijo.
 */
declare var SpeechRecognition:
  | {
      new (): SpeechRecognition;
    }
  | undefined;

/**
 * Constructor con prefijo WebKit (Chrome, Edge, Safari).
 * `undefined` en navegadores que solo exponen la versión estándar.
 */
declare var webkitSpeechRecognition:
  | {
      new (): SpeechRecognition;
    }
  | undefined;
``;
