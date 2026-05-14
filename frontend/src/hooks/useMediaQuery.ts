/**
 * Devuelve `true` si la media query CSS proporcionada se cumple, y se
 * actualiza reactivamente cuando cambia el tamaño de ventana.
 * Devuelve `false` en entornos sin `window` (SSR).
 *
 * Ejemplo:
 *   const isDesktop = useMediaQuery("(min-width: 768px)");
 */

import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const getMatches = (): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Sincroniza el estado al montar por si la query cambió desde la inicialización.
    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener("change", listener);

    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
