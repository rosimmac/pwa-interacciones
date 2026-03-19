# PWA – Fast Interaction Logging

## Overview

This Progressive Web App allows sales teams to quickly register customer interactions — meetings, inquiries, follow‑ups — in under **10 seconds**. It focuses on speed, usability and a clean, modern UX.

## 📍 Project Status

This project is in **active development** — new features and improvements are added daily as the app evolves toward a production-ready state.

---

# ⚡ PWA for Sales Interaction Tracking

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
<img width="370" height="804" alt="image" src="https://github.com/user-attachments/assets/8e98e458-b661-4031-9310-a44773a72595" />
<img width="366" height="799" alt="image" src="https://github.com/user-attachments/assets/5f09243a-38ed-4e29-b259-6d29ee6c71b4" />
<img width="369" height="797" alt="image" src="https://github.com/user-attachments/assets/cca31eb4-3b95-4a89-8df3-a610f285785f" />
<img width="365" height="805" alt="image" src="https://github.com/user-attachments/assets/f068eb5d-aeea-4534-bb94-4aeadd654783" />
<img width="364" height="799" alt="image" src="https://github.com/user-attachments/assets/6f228781-89ef-4a9a-bcd3-47a31183b225" />
<img width="367" height="810" alt="image" src="https://github.com/user-attachments/assets/b0831c65-a622-4015-8c97-d471a7c33e07" />
<img width="366" height="804" alt="image" src="https://github.com/user-attachments/assets/acc6da54-5384-4517-a98d-1fb113723823" />
<img width="369" height="803" alt="image" src="https://github.com/user-attachments/assets/5bd33ea1-1b2a-48ac-a35b-e3dd7a0a054e" />




## 👨‍💻 Author

Built by **Rosa María Martín Castillo** · [LinkedIn](https://www.linkedin.com/in/rosa-maria-martin-castillo/)
