import axios from "axios";

// -----------------------------
// CLIENTE AXIOS
// -----------------------------
export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

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

  // INTERACCIONES --------------------------
  getAllInteracciones: async (): Promise<Interaccion[]> => {
    const res = await apiClient.get("/interacciones");
    return res.data;
  },

  getInteracciones: async (params?: {
    tipo?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
  }): Promise<Interaccion[]> => {
    const res = await apiClient.get("/interacciones", {
      params: {
        _expand: "cliente",
        _expand2: "usuario", // JSON Server ignora duplicados, sirve igual
        tipo: params?.tipo,
        _page: params?.page,
        _limit: params?.limit,
        _sort: params?.sort ?? "fecha",
        _order: params?.order ?? "desc",
      },
    });
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

  createUsuario: async (payload: Omit<Usuario, "id">): Promise<Usuario> => {
    const res = await apiClient.post("/usuarios", payload);
    return res.data;
  },
  updateUsuario: async (
    id: number,
    payload: Partial<Usuario>,
  ): Promise<Usuario> => {
    const res = await apiClient.patch(`/usuarios/${id}`, payload);
    return res.data;
  },
  deleteUsuario: async (id: number): Promise<void> => {
    await apiClient.delete(`/usuarios/${id}`);
  },
};
