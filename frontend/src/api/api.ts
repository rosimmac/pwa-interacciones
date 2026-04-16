/**
 * Capa de acceso a la API REST del backend.
 *
 * Contenido del módulo:
 *   1. `apiClient`  — instancia de Axios con `baseURL` leída de la variable de
 *      entorno `VITE_API_URL` (fallback a `localhost:3000/api` para desarrollo).
 *      Dos interceptores:
 *        - Request:  inyecta el JWT de `localStorage` en cada cabecera `Authorization`.
 *        - Response: si el backend devuelve 401 fuera de `/login`, limpia la sesión
 *          y redirige automáticamente a la pantalla de login.
 *
 *   2. Tipos exportados (`Cliente`, `Usuario`, `Interaccion`, `InteraccionRequest`)
 *      — modelos de datos que reflejan las respuestas del backend.
 *      `InteraccionRequest` es el payload de escritura (usa `tipoId`/`estadoId`
 *      en lugar del objeto `tipo` anidado que devuelve el GET).
 *
 *   3. Objeto `api`  — métodos agrupados por recurso:
 *        - AUTH:          login, registro, recuperación y reset de contraseña.
 *        - CLIENTES:      CRUD completo.
 *        - USUARIOS:      CRUD completo; `updateUsuario` acepta `password?` opcional.
 *        - INTERACCIONES: CRUD completo.
 */

import type { RegistroSchema } from "@/schemas/registroSchema";
import type { UsuarioFormData } from "@/schemas/usuarioSchema";
import axios from "axios";

// ─── Cliente Axios ────────────────────────────────────────────────────────────

/** Instancia compartida de Axios con baseURL y Content-Type predeterminados. */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/** Inyecta el JWT almacenado en localStorage en cada petición saliente. */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Si el backend responde con 401 fuera de la ruta de login, limpia la sesión
 * y redirige al login para forzar una nueva autenticación.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("authUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Modelo de cliente devuelto por el backend. */
export type Cliente = {
  id: number;
  nombre: string;
  fechaCreacion: Date;
};

/** Modelo de usuario devuelto por el backend. */
export type Usuario = {
  id: number;
  email: string;
  nombre: string;
  rol: "admin" | "user" | "read-only";
};

/** Modelo de interacción devuelto por el backend (tipo como objeto anidado). */
export type Interaccion = {
  id: number;
  tipo: { id: number; nombre: string };
  descripcion: string;
  clienteId: number;
  usuarioId: number;
  fecha: string;
  cliente?: Cliente;
  usuario?: Usuario;
};

/**
 * Payload de escritura para crear o actualizar una interacción.
 * Usa `tipoId` y `estadoId` (claves foráneas) en lugar del objeto `tipo` anidado.
 */
export type InteraccionRequest = {
  id: number;
  tipoId: number;
  estadoId: number;
  descripcion: string;
  clienteId: number;
  usuarioId: number;
  fecha: string;
  cliente?: Cliente;
  usuario?: Usuario;
};

// ─── Métodos de API ───────────────────────────────────────────────────────────

export const api = {
  // ── AUTH ──────────────────────────────────────────────────────────────────

  /** Autentica al usuario y devuelve el token JWT junto con sus datos básicos. */
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

  /** Solicita el envío de un email de recuperación de contraseña. */
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post("/auth/forgot-password", { email });
  },

  /** Restablece la contraseña usando el token recibido por email. */
  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post("/auth/reset-password", { token, password });
  },

  /**
   * Registra un nuevo usuario con rol "user" por defecto.
   * Transforma el payload del schema de registro al formato que espera el endpoint.
   */
  registrarUsuario: async (
    payload: Omit<RegistroSchema, "id"> & { password: string },
  ): Promise<Usuario> => {
    const nuevoUsuario: UsuarioFormData = {
      nombre: payload.nombre,
      email: payload.email,
      password: payload.password,
      rol: "user",
    };
    const res = await apiClient.post("/auth/registro", nuevoUsuario);
    return res.data;
  },

  /** Cierra la sesión en el servidor (invalida el token). */
  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  // ── CLIENTES ──────────────────────────────────────────────────────────────

  /** Obtiene la lista completa de clientes. */
  getClientes: async (): Promise<Cliente[]> => {
    const res = await apiClient.get("/clientes");
    return res.data;
  },

  /** Crea un nuevo cliente. */
  createCliente: async (
    payload: Partial<Omit<Cliente, "id">>,
  ): Promise<Cliente> => {
    const res = await apiClient.post("/clientes", payload);
    return res.data;
  },

  /** Actualiza parcialmente un cliente existente. */
  updateCliente: async (
    id: number,
    payload: Partial<Omit<Cliente, "id">>,
  ): Promise<Cliente> => {
    const res = await apiClient.patch(`/clientes/${id}`, payload);
    return res.data;
  },

  /** Elimina un cliente por id. */
  deleteCliente: async (id: number): Promise<void> => {
    await apiClient.delete(`/clientes/${id}`);
  },

  // ── USUARIOS ──────────────────────────────────────────────────────────────

  /** Obtiene la lista completa de usuarios del sistema. */
  getUsuarios: async (): Promise<Usuario[]> => {
    const res = await apiClient.get("/usuarios");
    return res.data;
  },

  /** Crea un nuevo usuario con los datos del formulario. */
  createUsuario: async (
    payload: Omit<UsuarioFormData, "id"> & { password: string },
  ): Promise<Usuario> => {
    const res = await apiClient.post("/usuarios", payload);
    return res.data;
  },

  /**
   * Actualiza parcialmente un usuario.
   * `password` es opcional: si no se incluye, el backend no modifica la clave.
   */
  updateUsuario: async (
    id: number,
    payload: Partial<Usuario> & { password?: string },
  ): Promise<Usuario> => {
    const res = await apiClient.patch(`/usuarios/${id}`, payload);
    return res.data;
  },

  /** Elimina un usuario por id. */
  deleteUsuario: async (id: number): Promise<void> => {
    await apiClient.delete(`/usuarios/${id}`);
  },

  // ── INTERACCIONES ─────────────────────────────────────────────────────────

  /** Obtiene la lista de interacciones (filtrada por rol en el backend). */
  getInteracciones: async (): Promise<Interaccion[]> => {
    const res = await apiClient.get("/interacciones");
    return res.data;
  },

  /** Crea una nueva interacción con el payload de escritura. */
  createInteraccion: async (
    payload: Omit<InteraccionRequest, "id">,
  ): Promise<Interaccion> => {
    const res = await apiClient.post("/interacciones", payload);
    return res.data;
  },

  /** Actualiza parcialmente una interacción existente. */
  updateInteraccion: async (
    id: number,
    payload: Partial<Interaccion>,
  ): Promise<Interaccion> => {
    const res = await apiClient.patch(`/interacciones/${id}`, payload);
    return res.data;
  },

  /** Elimina una interacción por id. */
  deleteInteraccion: async (id: number): Promise<void> => {
    await apiClient.delete(`/interacciones/${id}`);
  },
};
