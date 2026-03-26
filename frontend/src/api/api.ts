import axios from "axios";

// -----------------------------
// CLIENTE AXIOS
// -----------------------------
export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: añade el token JWT en cada petición automáticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: si el backend devuelve 401, limpia la sesión
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("authUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// -----------------------------
// TIPOS
// -----------------------------
export type Cliente = {
  id: number;
  nombre: string;
};

export type Usuario = {
  id: number;
  email: string;
  nombre: string;
  rol: "admin" | "user" | "read-only";
};

export type Interaccion = {
  id: number;
  tipo: "consulta" | "reunion" | "antecedente";
  descripcion: string;
  clienteId: number;
  usuarioId: number;
  fecha: string;
  cliente?: Cliente;
  usuario?: Usuario;
};

export const api = {
  // AUTH -----------------------------------
  login: async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });
    return res.data as {
      token: string;
      usuario: {
        id: number;
        nombre: string;
        email: string;
        rol: "admin" | "user" | "read-only";
      };
    };
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  // CLIENTES -------------------------------
  getClientes: async (): Promise<Cliente[]> => {
    const res = await apiClient.get("/clientes");
    return res.data;
  },

  createCliente: async (payload: Omit<Cliente, "id">): Promise<Cliente> => {
    const res = await apiClient.post("/clientes", payload);
    return res.data;
  },

  updateCliente: async (
    id: number,
    payload: Partial<Omit<Cliente, "id">>,
  ): Promise<Cliente> => {
    const res = await apiClient.patch(`/clientes/${id}`, payload);
    return res.data;
  },

  deleteCliente: async (id: number): Promise<void> => {
    await apiClient.delete(`/clientes/${id}`);
  },

  // USUARIOS -------------------------------
  getUsuarios: async (): Promise<Usuario[]> => {
    const res = await apiClient.get("/usuarios");
    return res.data;
  },

  createUsuario: async (
    payload: Omit<Usuario, "id"> & { password: string },
  ): Promise<Usuario> => {
    const res = await apiClient.post("/usuarios", payload);
    return res.data;
  },

  updateUsuario: async (
    id: number,
    payload: Partial<Usuario> & { password?: string },
  ): Promise<Usuario> => {
    const res = await apiClient.patch(`/usuarios/${id}`, payload);
    return res.data;
  },

  deleteUsuario: async (id: number): Promise<void> => {
    await apiClient.delete(`/usuarios/${id}`);
  },

  // INTERACCIONES --------------------------
  getInteracciones: async (): Promise<Interaccion[]> => {
    const res = await apiClient.get("/interacciones");
    return res.data;
  },

  createInteraccion: async (
    payload: Omit<Interaccion, "id">,
  ): Promise<Interaccion> => {
    const res = await apiClient.post("/interacciones", payload);
    return res.data;
  },

  updateInteraccion: async (
    id: number,
    payload: Partial<Interaccion>,
  ): Promise<Interaccion> => {
    const res = await apiClient.patch(`/interacciones/${id}`, payload);
    return res.data;
  },

  deleteInteraccion: async (id: number): Promise<void> => {
    await apiClient.delete(`/interacciones/${id}`);
  },
};
