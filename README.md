# PWA – Fast Interaction Logging

## Overview

This Progressive Web App allows sales teams to quickly register customer interactions — meetings, inquiries, follow‑ups — in under **10 seconds**. It focuses on speed, usability and a clean, modern UX.

## 📍 Project Status

This project is in **active development** — new features and improvements are added daily as the app evolves toward a production-ready state.

---

# ⚡ FastLog — PWA for Sales Interaction Tracking

> Register a customer interaction in under 10 seconds.

---

---

## ✨ Features

| Feature               | Detail                                     |
| --------------------- | ------------------------------------------ |
| ⚡ Ultra-fast logging | Full interaction registered in <10 seconds |
| 👥 Role-based access  | `admin` / `user` / `read-only` permissions |
| 🎤 Voice input        | Hands-free field dictation                 |
| 📊 Client dashboard   | Interaction history and key metrics        |
| 📱 Mobile-first       | Fully responsive, installable as PWA       |
| 🛡 Type-safe forms    | React Hook Form + Zod validation           |
| 🎨 Figma-designed     | UI built from custom design system         |

---

## 🛠 Tech Stack

### Frontend

|               |                          |
| ------------- | ------------------------ |
| Framework     | React 18 + TypeScript    |
| Build tool    | Vite                     |
| Styling       | Tailwind CSS + shadcn/ui |
| Routing       | React Router v7          |
| Forms         | React Hook Form + Zod    |
| Notifications | Sonner                   |

### Mock Backend

|           |                                         |
| --------- | --------------------------------------- |
| Server    | JSON Server                             |
| Resources | `clientes`, `interacciones`, `usuarios` |
| Port      | `3001`                                  |

---

## 🏗 Architecture

```
src/
├── components/      # Shared UI components
├── context/         # Auth context (role-based)
├── pages/           # Route-level views
├── schemas/         # Zod validation schemas
├── hooks/           # Custom hooks
└── router/          # Route definitions + guards
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
git clone https://github.com/rosimmac/pwa-interacciones.git
cd pwa-interacciones
npm install
```

### Development

```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Mock backend
npx json-server --watch mock/db.json --port 3001
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| API      | http://localhost:3001 |

---

## 🔐 Auth (current)

Authentication is currently mocked via `localStorage` + React Context, simulating a JWT-based flow.

When the real backend is integrated, the following will need to be updated:

- `AuthContext` — store and attach the JWT token to every request
- `onSubmit` handlers — replace mock delays with real API calls
- All API calls — point to the real backend and handle auth headers
- Role assignment — driven by the server response instead of hardcoded values

**Roles:**

| Role        | Permissions                 |
| ----------- | --------------------------- |
| `admin`     | Full access                 |
| `user`      | Create and view own records |
| `read-only` | View only                   |

---

## 👨‍💻 Author

Built by **Rosa María Martín Castillo** · [LinkedIn](https://www.linkedin.com/in/rosa-maria-martin-castillo/)
