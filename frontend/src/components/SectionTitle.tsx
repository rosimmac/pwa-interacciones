/**
 * Título de sección dentro de una página de listado.
 *
 * Renderiza un `<h2>` con estilos tipográficos consistentes.
 * Acepta cualquier nodo React como contenido a través de `children`.
 */

export function SectionTitle({ children }: React.PropsWithChildren) {
  return (
    <h2 className="px-4 mt-6 mb-2 font-bold text-lg text-gray-800">
      {children}
    </h2>
  );
}
