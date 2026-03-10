// src/api/api.ts
//TENEMOS TODAS LAS LLAMADAS A LA API EN UN SOLO SITIO. Las páginas solo van a importar funciones
const BASE_URL = "http://localhost:3001"; // o "/api" si usas proxy en Vite

// Helpers básicos
async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
  return res.json() as Promise<T>;
}

// Tipos (ajústalos a tus modelos)
export type Cliente = { id: number; nombre: string };
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
  fecha: string; // ISO
  cliente?: Cliente;
  usuario?: Usuario;
};

// Endpoints
export const api = {
  // Clientes
  getClientes: () => http<Cliente[]>("/clientes"),

  // Usuarios
  findUsuarioByEmail: (email: string) =>
    http<Usuario[]>(`/usuarios?email=${encodeURIComponent(email)}`),

  // Interacciones
  getInteracciones: (params?: {
    tipo?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
  }) => {
    const q = new URLSearchParams();
    q.set("_expand", "cliente"); // importante para mostrar nombre de cliente
    q.append("_expand", "usuario");
    if (params?.tipo) q.set("tipo", params.tipo);
    if (params?.page) q.set("_page", String(params.page));
    if (params?.limit) q.set("_limit", String(params.limit));
    q.set("_sort", params?.sort ?? "fecha");
    q.set("_order", params?.order ?? "desc");
    console.log(`/interacciones?${q.toString()}`);
    return http<Interaccion[]>(`/interacciones?${q.toString()}`);
  },

  createInteraccion: (payload: Omit<Interaccion, "id">) =>
    http<Interaccion>("/interacciones", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateInteraccion: (id: number, payload: Partial<Interaccion>) =>
    http<Interaccion>(`/interacciones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteInteraccion: (id: number) =>
    http<void>(`/interacciones/${id}`, { method: "DELETE" }),
};
