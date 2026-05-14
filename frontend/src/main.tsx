/**
 * Punto de entrada de la aplicación.
 *
 * `StrictMode` está desactivado intencionalmente: en desarrollo React ejecuta
 * los efectos dos veces para detectar efectos secundarios no idempotentes, lo
 * que interfiere con APIs de estado único como `SpeechRecognition` y duplica
 * las llamadas de red en los `useEffect` de carga inicial.
 */

import { createRoot } from "react-dom/client";
import "./index.css";
import { InteraccionesApp } from "./InteraccionesApp";

createRoot(document.getElementById("root")!).render(<InteraccionesApp />);
