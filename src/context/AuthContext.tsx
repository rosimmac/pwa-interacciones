import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

/**
 * Estados posibles del flujo de autenticación:
 * - "checking": la app está verificando si hay sesión previa (por ejemplo, al iniciar o recargar).
 * - "authenticated": el usuario tiene sesión iniciada.
 * - "not-authenticated": no hay sesión activa.
 */
type AuthStatus = "checking" | "authenticated" | "not-authenticated";

/**
 * Modelo de usuario autenticado.
 */
export interface User {
  email: string;
  role: "admin" | "user" | "read-only";
}

/**
 * Contrato que define qué expone el contexto de autenticación a los consumidores.
 * Garantiza tipado estricto y autocompletado en toda la app.
 */
interface AuthContextProps {
  authStatus: AuthStatus;
  user: User | null;
  isAuthenticated: boolean;

  // Acciones públicas del contexto
  login: (email: string, role: User["role"]) => void;
  logout: () => void;
}

/**
 * Creación del contexto de autenticación.
 * Se usa type assertion porque el valor real se inyecta desde el Provider.
 */
export const AuthContext = createContext({} as AuthContextProps);

/**
 * AuthProvider
 * ------------
 * Componente de alto nivel que:
 *  - Mantiene el estado global de autenticación.
 *  - Expone los datos y acciones (login/logout) a través del Context.
 *  - Restaura sesión desde almacenamiento persistente al montar.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  // Estado del ciclo de autenticación (checking / authenticated / not-authenticated)
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

  // Datos del usuario autenticado (o null si no hay)
  const [user, setUser] = useState<User | null>(null);

  /**
   * login
   * -----
   * Login simulado: establece el usuario en memoria, marca como autenticado
   * y persiste el identificador básico (email) en localStorage.
   * Nota: en producción, aquí debería:
   *  - llamarse al backend,
   *  - validarse credenciales,
   *  - almacenarse token seguro (p. ej., cookie httpOnly, no localStorage),
   *  - y derivarse el rol/claims del usuario.
   */
  const login = (email: string, role: "admin" | "user" | "read-only") => {
    setUser({ email, role });
    setAuthStatus("authenticated");
    localStorage.setItem("authEmail", email);
    localStorage.setItem("authRole", role);
  };

  /**
   * logout
   * ------
   * Limpia el estado de usuario y la persistencia local.
   * Ideal para invocarlo al expirar token, pulsar "Cerrar sesión", o al recibir 401/403 global.
   */
  const logout = () => {
    setAuthStatus("not-authenticated");
    setUser(null);
    localStorage.removeItem("authEmail");
    localStorage.removeItem("authRole");
  };

  /**
   * Persistencia y restauración de sesión
   * -------------------------------------
   * Al montar el Provider:
   *  - Busca "authEmail" en localStorage para restaurar la sesión.
   *  - Si existe, simula login (estado consistente tras recarga).
   *  - Si no existe, fuerza estado no autenticado.
   *
   * Importante: este patrón simplifica el flujo mientras no hay backend.
   * Cuando integremos backend, convendrá:
   *  - verificar token (p. ej. /auth/refresh o /me),
   *  - manejar expiraciones y errores,
   *  - y evitar guardar credenciales sensibles en localStorage.
   */
  useEffect(() => {
    const email = localStorage.getItem("authEmail");
    const role = localStorage.getItem("authRole") as
      | "admin"
      | "user"
      | "read-only"
      | null;

    if (email && role) {
      setUser({ email, role });
      setAuthStatus("authenticated");
      return;
    }

    logout();
  }, []);

  /**
   * Exposición del contexto a través del Provider.
   * - `isAuthenticated` es un valor derivado del estado, útil para proteger rutas y condicionar UI.
   * - `authStatus` permite manejar pantallas de carga (spinner) mientras está "checking".
   */
  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        isAuthenticated: authStatus === "authenticated",

        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook de acceso al contexto
 * --------------------------
 * Envuelve useContext para:
 *  - Centralizar el import del AuthContext.
 *  - Obtener tipado completo sin repetir `useContext(AuthContext)` en cada componente.
 */
export function useAuth() {
  return useContext(AuthContext);
}
