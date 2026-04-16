/**
 * Tests de integración de LoginPage.
 *
 * Estrategia de aislamiento:
 *   - El módulo `@/api/api` se reemplaza por completo con vi.mock para evitar
 *     peticiones HTTP reales. LoginPage solo importa `api.login`, por lo que
 *     solo se necesita ese stub.
 *   - AuthContext se provee mediante un valor mock directo sobre el Provider
 *     para desacoplar el test del comportamiento de AuthProvider (localStorage,
 *     estado, etc.).
 *   - MemoryRouter proporciona el contexto de enrutamiento que requieren
 *     `useNavigate` y `<Link>` sin necesidad de un historial real de navegador.
 *
 * Por qué se usa `noValidate` en el formulario:
 *   jsdom implementa la validación HTML5 nativa y bloquea el evento `submit`
 *   cuando un <input type="email"> contiene un valor con formato incorrecto.
 *   Con `noValidate`, toda la validación recae en Zod a través de react-hook-form,
 *   que es el comportamiento deseado tanto en tests como en producción.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";
import { LoginPage } from "../LoginPage";
import { AuthContext } from "@/context/AuthContext";

// Sustituye todo el módulo de API por stubs vacíos. vi.mock se eleva
// automáticamente al inicio del fichero por el compilador de Vitest.
vi.mock("@/api/api", () => ({
  api: {
    login: vi.fn(),
  },
}));

/**
 * Valor de contexto mínimo para que LoginPage pueda desestructurar `login`
 * sin errores en tiempo de ejecución.
 * `clearMocks: true` en vitest.config limpia el historial de llamadas de
 * los vi.fn() entre tests, por lo que no es necesario un beforeEach manual.
 */
const mockContextValue = {
  authStatus: "not-authenticated" as const,
  user: null,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
};

/**
 * Componente wrapper que proporciona a LoginPage los dos contextos que necesita:
 *   1. AuthContext.Provider  → expone la función `login` al componente
 *   2. MemoryRouter          → satisface los hooks de react-router
 *
 * Se pasa como `wrapper` a la función `render` de RTL para que cada test
 * parta siempre del mismo entorno sin repetir el boilerplate.
 */
function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={mockContextValue}>
      <MemoryRouter>{children}</MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("LoginPage", () => {
  /**
   * Test de estructura: comprueba que el formulario renderiza todos sus
   * elementos interactivos antes de cualquier acción del usuario.
   */
  it("renderiza los elementos del formulario", () => {
    render(<LoginPage />, { wrapper: Wrapper });

    // Campos de entrada identificados por su placeholder
    expect(
      screen.getByPlaceholderText("admin@sales.com"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();

    // Botones por su rol semántico y nombre accesible
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /registro/i }),
    ).toBeInTheDocument();

    // Enlace de recuperación de contraseña
    expect(
      screen.getByRole("link", { name: /olvidado/i }),
    ).toBeInTheDocument();
  });

  /**
   * Test de validación: comprueba que react-hook-form + zodResolver muestran
   * los mensajes de error de ambos campos cuando el formulario se envía vacío.
   * Se usa `findByText` (asíncrono) porque react-hook-form actualiza el estado
   * de errores en el siguiente ciclo de render tras el submit.
   */
  it("muestra errores de validación al enviar el formulario vacío", async () => {
    // userEvent.setup() crea una instancia que envuelve cada interacción en
    // `act` automáticamente, garantizando que los updates de React se procesan.
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: Wrapper });

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    // Ambos errores deben aparecer en el DOM tras el ciclo de validación.
    expect(
      await screen.findByText(/introduce un email válido/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/contraseña es obligatoria/i),
    ).toBeInTheDocument();
  });

  /**
   * Test de validación de formato: comprueba que Zod detecta un email
   * mal formado aunque el campo no esté vacío.
   * El formulario lleva `noValidate` para que jsdom no intercepte el submit
   * antes de que llegue a react-hook-form (ver comentario de módulo).
   */
  it("muestra error cuando el email tiene formato inválido", async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: Wrapper });

    // Simula escritura carácter a carácter disparando los eventos de teclado.
    await user.type(
      screen.getByPlaceholderText("admin@sales.com"),
      "esto-no-es-un-email",
    );
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(
      await screen.findByText(/introduce un email válido/i),
    ).toBeInTheDocument();
  });
});
