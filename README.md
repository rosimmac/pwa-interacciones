# PWA – Fast Interaction Logging
Register a customer interaction in under 10 seconds.

A Progressive Web App for sales teams to quickly log customer interactions — meetings, inquiries, follow-ups — with a focus on speed, usability and clean UX. Built as a full-stack project with a real NestJS backend and MySQL database, fully deployed to production.

## Live Demo

🔗 [pwa-interacciones.vercel.app](https://pwa-interacciones.vercel.app/)

| Field    | Value              |
|----------|--------------------|
| Email    | carlos@example.com |
| Password | Pass1234.           |
| Role     | `user`             |

## Project Status

Deployed and live — frontend on Vercel, backend on Railway.

## Features

| Feature | Detail |
|---|---|
| ⚡ Ultra-fast logging | Full interaction registered in <10 seconds |
| 👥 Role-based access | `admin` / `user` / `read-only` permissions |
| 🎤 Voice input | Hands-free field dictation via Web Speech API |
| 📊 Client dashboard | Interaction history and key metrics |
| 📱 Mobile-first | Fully responsive, installable as PWA |
| 🛡 Type-safe forms | React Hook Form + Zod validation |
| 🔐 JWT auth | Real authentication with access logging |
| 🔑 Password recovery | Email-based reset flow via Nodemailer |
| 🎨 Figma-designed | UI built from custom design system |

## Tech Stack

### Frontend

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod |
| HTTP client | Axios (with JWT interceptors) |
| Notifications | Sonner |

### Backend

| | |
|---|---|
| Framework | NestJS |
| Language | TypeScript |
| ORM | TypeORM |
| Database | MySQL (Docker local / Railway in production) |
| Auth | JWT + bcrypt |
| Email | Nodemailer + Gmail App Passwords |
| API | REST with global `/api` prefix |

## Architecture

```
pwa-interacciones/
├── frontend/
│   └── src/
│       ├── components/       # Shared UI components
│       ├── context/          # AuthContext (JWT + role persistence)
│       ├── pages/            # Route-level views
│       ├── schemas/          # Zod validation schemas
│       ├── hooks/            # Custom hooks (usePermisos, useSpeechRecognition...)
│       ├── api/              # Axios instance + JWT interceptors
│       └── router/           # Route definitions + role guards
└── backend/
    └── src/
        ├── auth/             # JWT strategy, guards, login/logout
        ├── usuarios/         # Users module + CRUD
        ├── clientes/         # Clients module + CRUD
        ├── interacciones/    # Interactions module + CRUD
        ├── registro-accesos/ # Login/logout access log
        └── entities/         # TypeORM entities
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Docker (for local MySQL)

### Installation

```bash
git clone https://github.com/rosimmac/pwa-interacciones.git
cd pwa-interacciones
```

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### Development

```bash
# Terminal 1 — MySQL via Docker
docker compose up -d

# Terminal 2 — Backend (NestJS)
cd backend
npm run start:dev

# Terminal 3 — Frontend (Vite)
cd frontend
npm run dev
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API      | http://localhost:3000/api |
| MySQL    | localhost:3306 |

## Authentication

Authentication is handled by the NestJS backend using JWT tokens and bcrypt password hashing.

- Login returns a signed JWT token stored in `localStorage`
- Every request includes the token via an Axios interceptor
- Protected routes use a `JwtAuthGuard` on the backend
- Access attempts are logged to a `registro_accesos` table
- Password recovery via email token with expiry

### Roles

| Role | Permissions |
|---|---|
| `admin` | Full access — manage users, clients and interactions |
| `user` | Create and view own records |
| `read-only` | View only |

## Screenshots

<img width="370" height="804" alt="image" src="https://github.com/user-attachments/assets/8e98e458-b661-4031-9310-a44773a72595" />
<img width="366" height="799" alt="image" src="https://github.com/user-attachments/assets/5f09243a-38ed-4e29-b259-6d29ee6c71b4" />
<img width="369" height="797" alt="image" src="https://github.com/user-attachments/assets/cca31eb4-3b95-4a89-8df3-a610f285785f" />
<img width="365" height="805" alt="image" src="https://github.com/user-attachments/assets/f068eb5d-aeea-4534-bb94-4aeadd654783" />
<img width="364" height="799" alt="image" src="https://github.com/user-attachments/assets/6f228781-89ef-4a9a-bcd3-47a31183b225" />
<img width="367" height="810" alt="image" src="https://github.com/user-attachments/assets/b0831c65-a622-4015-8c97-d471a7c33e07" />
<img width="366" height="804" alt="image" src="https://github.com/user-attachments/assets/acc6da54-5384-4517-a98d-1fb113723823" />
<img width="369" height="803" alt="image" src="https://github.com/user-attachments/assets/5bd33ea1-1b2a-48ac-a35b-e3dd7a0a054e" />

---

## Author

Built by **Rosa María Martín Castillo** · [LinkedIn](https://www.linkedin.com/in/rosa-maria-martin-castillo/)
