PWA – Registro Rápido de Interacciones
Registra una interacción con un cliente en menos de 10 segundos.
Aplicación web progresiva (PWA) para equipos comerciales que necesitan registrar interacciones con clientes de forma ágil — reuniones, consultas, seguimientos — con foco en velocidad, usabilidad y una UX limpia. Desarrollada como proyecto full-stack con backend real en NestJS y base de datos MySQL, completamente desplegada en producción.

Demo en vivo
🔗 pwa-interacciones.vercel.app
CampoValorEmailcarlos@example.comContraseñaPass1234.Roluser
Estado del proyecto
Desplegado y en producción — frontend en Vercel, backend en Railway.
Funcionalidades
FuncionalidadDetalle⚡ Registro ultrarrápidoInteracción completa registrada en menos de 10 segundos👥 Control de acceso por rolesPermisos admin / user / solo lectura🎤 Entrada por vozDictado de campos manos libres con Web Speech API📊 Panel de clientesHistorial de interacciones y métricas clave📱 Mobile-firstTotalmente responsiva e instalable como PWA🛡 Formularios con validaciónReact Hook Form + Zod🔐 Autenticación JWTAutenticación real con registro de accesos🔑 Recuperación de contraseñaFlujo de restablecimiento por email con Nodemailer🎨 Diseñada en FigmaInterfaz construida desde un sistema de diseño propio
Stack tecnológico
Frontend
FrameworkReact 18 + TypeScriptBundlerViteEstilosTailwind CSS v4 + shadcn/uiEnrutamientoReact Router v7FormulariosReact Hook Form + ZodCliente HTTPAxios (con interceptores JWT)NotificacionesSonner
Backend
FrameworkNestJSLenguajeTypeScriptORMTypeORMBase de datosMySQL (Docker en local / Railway en producción)AutenticaciónJWT + bcryptEmailNodemailer + App Passwords de GmailAPIREST con prefijo global /api
Arquitectura
pwa-interacciones/
├── frontend/
│ └── src/
│ ├── components/ # Componentes de UI reutilizables
│ ├── context/ # AuthContext (JWT + persistencia de rol)
│ ├── pages/ # Vistas a nivel de ruta
│ ├── schemas/ # Esquemas de validación Zod
│ ├── hooks/ # Hooks personalizados (usePermisos, useSpeechRecognition...)
│ ├── api/ # Instancia Axios + interceptores JWT
│ └── router/ # Definición de rutas + guardias por rol
└── backend/
└── src/
├── auth/ # Estrategia JWT, guardias, login/logout
├── usuarios/ # Módulo de usuarios + CRUD
├── clientes/ # Módulo de clientes + CRUD
├── interacciones/ # Módulo de interacciones + CRUD
├── registro-accesos/ # Log de accesos login/logout
└── entities/ # Entidades TypeORM
Puesta en marcha
Requisitos previos

Node.js ≥ 18
npm ≥ 9
Docker (para MySQL en local)

Instalación
bashgit clone https://github.com/rosimmac/pwa-interacciones.git
cd pwa-interacciones
bash# Frontend
cd frontend && npm install

# Backend

cd ../backend && npm install
Desarrollo
bash# Terminal 1 — MySQL con Docker
docker compose up -d

# Terminal 2 — Backend (NestJS)

cd backend
npm run start:dev

# Terminal 3 — Frontend (Vite)

cd frontend
npm run dev
ServicioURLFrontendhttp://localhost:5173APIhttp://localhost:3000/apiMySQLlocalhost:3306
Autenticación
La autenticación la gestiona el backend NestJS mediante tokens JWT y hash de contraseñas con bcrypt.

El login devuelve un token JWT firmado que se almacena en localStorage
Cada petición incluye el token a través de un interceptor de Axios
Las rutas protegidas usan JwtAuthGuard en el backend
Los intentos de acceso se registran en la tabla registro_accesos
Recuperación de contraseña mediante token por email con caducidad

Roles
RolPermisosadminAcceso completo — gestión de usuarios, clientes e interaccionesuserCrear y consultar sus propios registrossolo lecturaSolo visualización
Capturas de pantalla
<img width="370" height="804" alt="image" src="https://github.com/user-attachments/assets/8e98e458-b661-4031-9310-a44773a72595" />
<img width="366" height="799" alt="image" src="https://github.com/user-attachments/assets/5f09243a-38ed-4e29-b259-6d29ee6c71b4" />
<img width="369" height="797" alt="image" src="https://github.com/user-attachments/assets/cca31eb4-3b95-4a89-8df3-a610f285785f" />
<img width="365" height="805" alt="image" src="https://github.com/user-attachments/assets/f068eb5d-aeea-4534-bb94-4aeadd654783" />
<img width="364" height="799" alt="image" src="https://github.com/user-attachments/assets/6f228781-89ef-4a9a-bcd3-47a31183b225" />
<img width="367" height="810" alt="image" src="https://github.com/user-attachments/assets/b0831c65-a622-4015-8c97-d471a7c33e07" />
<img width="366" height="804" alt="image" src="https://github.com/user-attachments/assets/acc6da54-5384-4517-a98d-1fb113723823" />
<img width="369" height="803" alt="image" src="https://github.com/user-attachments/assets/5bd33ea1-1b2a-48ac-a35b-e3dd7a0a054e" />

Autora
Desarrollado por Rosa María Martín Castillo · LinkedIn
