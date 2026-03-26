import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

type AuthStatus = "checking" | "authenticated" | "not-authenticated";

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: "admin" | "user" | "read-only";
}

interface AuthContextProps {
  authStatus: AuthStatus;
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext({} as AuthContextProps);

export function AuthProvider({ children }: PropsWithChildren) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() => {
    const token = localStorage.getItem("token");
    return token ? "authenticated" : "not-authenticated";
  });

  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  });

  const login = (user: User, token: string) => {
    setUser(user);
    setAuthStatus("authenticated");
    localStorage.setItem("token", token);
    localStorage.setItem("authUser", JSON.stringify(user));
  };

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
