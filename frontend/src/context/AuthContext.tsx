/**
 * Contexto de autenticación de la aplicación.
 *
 * Gestiona el estado de sesión del usuario (autenticado / no autenticado /
 * comprobando) y persiste el token JWT y los datos del usuario en
 * `localStorage` para sobrevivir recargas de página.
 *
 * Exporta:
 *   - `AuthContext`   – contexto React con las props de autenticación.
 *   - `AuthProvider`  – proveedor que envuelve la aplicación.
 *   - `useAuth`       – hook de conveniencia para consumir el contexto.
 *   - `User`          – interfaz del usuario autenticado.
 */

import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

/** Estados posibles de la sesión durante el ciclo de vida de la app. */
type AuthStatus = "checking" | "authenticated" | "not-authenticated";

/** Datos del usuario autenticado que se almacenan en sesión. */
export interface User {
  id: number;
  nombre: string;
  email: string;
  /** Rol que determina los permisos de acceso en rutas y UI. */
  role: "admin" | "user" | "read-only";
}

/** Forma del valor expuesto por AuthContext. */
interface AuthContextProps {
  authStatus: AuthStatus;
  user: User | null;
  /** Derivado de `authStatus` para simplificar los guards de ruta. */
  isAuthenticated: boolean;
  /** Persiste el token y los datos del usuario; actualiza el estado. */
  login: (user: User, token: string) => void;
  /** Elimina el token y los datos del usuario; restablece el estado. */
  logout: () => void;
}

/**
 * Se inicializa con un objeto vacío casteado al tipo correcto.
 * El contexto siempre se consume dentro de `AuthProvider`, por lo que
 * el valor por defecto nunca se usa en producción.
 */
export const AuthContext = createContext({} as AuthContextProps);

/** Proveedor que inicializa el estado desde `localStorage` al montar. */
export function AuthProvider({ children }: PropsWithChildren) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() => {
    // Si hay token almacenado, asumimos sesión activa sin verificar con el backend.
    const token = localStorage.getItem("token");
    return token ? "authenticated" : "not-authenticated";
  });

  const [user, setUser] = useState<User | null>(() => {
    // Reconstruimos el usuario desde localStorage para evitar la pantalla en blanco.
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  });

  /** Inicia sesión: guarda token + usuario en memoria y en localStorage. */
  const login = (user: User, token: string) => {
    setUser(user);
    setAuthStatus("authenticated");
    localStorage.setItem("token", token);
    localStorage.setItem("authUser", JSON.stringify(user));
  };

  /** Cierra sesión: limpia memoria y localStorage. */
  const logout = () => {
    setAuthStatus("not-authenticated");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        // `isAuthenticated` es un derivado calculado para evitar comparaciones
        // en todos los componentes que consumen el contexto.
        isAuthenticated: authStatus === "authenticated",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook de conveniencia: equivale a `useContext(AuthContext)`. */
export function useAuth() {
  return useContext(AuthContext);
}
