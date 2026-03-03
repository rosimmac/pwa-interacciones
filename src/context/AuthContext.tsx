import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

type AuthStatus = "checking" | "authenticated" | "not-authenticated";

interface User {
  email: string;
}

interface AuthContextProps {
  authStatus: AuthStatus;
  user: User | null;
  isAuthenticated: boolean;

  login: (email: string) => void;
  logout: () => void;
}

export const AuthContext = createContext({} as AuthContextProps);

// Provider
export function AuthProvider({ children }: PropsWithChildren) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<User | null>(null);

  // Login simulado (luego se cambiará por una llamada a backend)
  const login = (email: string) => {
    setUser({ email });
    setAuthStatus("authenticated");
    localStorage.setItem("authEmail", email);
  };

  const logout = () => {
    setAuthStatus("not-authenticated");
    setUser(null);
    localStorage.removeItem("authEmail");
  };

  // Persistencia
  useEffect(() => {
    const email = localStorage.getItem("authEmail");

    if (email) {
      login(email);
      return;
    }

    logout();
  }, []);

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

export function useAuth() {
  return useContext(AuthContext);
}
