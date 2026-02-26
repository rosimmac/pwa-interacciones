import { useEffect, useState } from "react";

/**
 * useMediaQuery(query)
 *
 * Devuelve TRUE si la media query se cumple.
 * Ejemplo:
 *   useMediaQuery("(min-width: 768px)") → TRUE si la pantalla es ≥ 768px
 *
 * Además incluye comprobaciones para evitar errores en SSR
 * (cuando window aún no existe).
 */
export function useMediaQuery(query: string) {
  /**
   * Función que comprueba si la media query se cumple.
   * La separamos porque la usamos al inicio y dentro del efecto.
   */
  const getMatches = (): boolean => {
    // Si estamos en servidor (SSR), window no existe → devolvemos false
    if (typeof window === "undefined") return false;

    // Aquí pedimos al navegador si la media query se cumple
    return window.matchMedia(query).matches;
  };

  /**
   * El estado que guardará si la media query se cumple o no.
   * Por defecto lo inicializamos llamando a getMatches()
   */
  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    // Si window no existe, evitamos errores
    if (typeof window === "undefined") return;

    // Creamos el objeto de media query
    const mediaQueryList = window.matchMedia(query);

    /**
     * Listener (escuchador):
     * Esta función se ejecuta automáticamente cuando el tamaño
     * de la pantalla cambia y la media query pasa de cumplirse a no cumplirse,
     * o al revés.
     */
    const listener = (event: MediaQueryListEvent) => {
      // event.matches es true o false dependiendo de si la media query se cumple
      setMatches(event.matches);
    };

    // Sincronizamos el estado cuando el componente se monta
    setMatches(mediaQueryList.matches);

    // Nos suscribimos a cambios en la media query
    mediaQueryList.addEventListener("change", listener);

    // Cuando el componente se desmonta → quitamos el listener
    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]); // Se ejecuta si cambias la media query

  // Devolvemos si la media query está siendo verdadera
  return matches;
}
