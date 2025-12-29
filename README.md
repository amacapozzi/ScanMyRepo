# Bun Elysia Modular Starter

A **production-ready starter template** for building scalable APIs using **Bun + Elysia**, following a **modular, clean architecture** approach with modern tooling.

This repository is designed to be:

- easy to understand
- easy to extend
- safe to scale
- strict but not painful

---

## ✨ Features

- ⚡ **Bun** – ultra-fast JavaScript runtime
- 🧠 **Elysia** – minimal and high-performance web framework
- 🧩 **Modular architecture (feature-based)**
- 🧼 Clean code & separation of concerns
- 🧭 Import aliases (`@app`, `@shared`, `@modules`)
- ✅ **TypeScript (strict mode)**
- 🧪 Environment validation with **Zod**
- 🧹 **ESLint (TypeScript-aware)**
- 🎨 **Prettier**
- 🪝 **Husky + lint-staged**
- 📏 **commitlint (Conventional Commits)**

---

## 📁 Project Structure

src/
├─ app/ # App bootstrap & composition root
│ ├─ container.ts
│ ├─ server.ts
│ └─ index.ts
│
├─ modules/ # Feature-based modules
│ └─ health/
│ ├─ domain/
│ ├─ application/
│ ├─ infrastructure/
│ └─ index.ts
│
└─ shared/ # Cross-cutting concerns
├─ config/
├─ constants/
├─ env/
├─ logger/
└─ errors/

### Architecture rules (important)

- `app/` **only wires things together**
- `modules/` contain business logic and features
- `shared/` contains reusable, global utilities
- `modules` **must not depend on `app`**
- business logic never depends on HTTP or framework code

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
bun install

2. Setup environment variables
cp .env.example .env

3. Run in development mode
bun dev


The server will start at:

http://localhost:3000

🧪 Scripts
Command	Description
bun dev	Start dev server (watch mode)
bun start	Start production server
bun lint	Run ESLint (TypeScript-aware)
bun lint:fix	Fix lint issues automatically
bun typecheck	Run TypeScript type checking
🧩 Creating a New Module

Create a folder inside src/modules

modules/users/
├─ domain/          # Business rules (pure)
├─ application/     # Use cases
├─ infrastructure/  # HTTP routes, DB adapters
└─ index.ts


Export an Elysia plugin from index.ts

Register the module in app/container.ts

Each module should be self-contained and portable.

🧠 Request Flow
HTTP (Elysia route)
   ↓
Application (use case)
   ↓
Domain (business rules)
   ↓
Infrastructure (DB / external services)
   ↓
Response

🧾 Commit Convention

This project enforces Conventional Commits:

feat: add user authentication
fix: handle invalid token
refactor: simplify health module


Commits are validated automatically via Husky + commitlint.

🛠️ Recommended Add-ons

@elysiajs/swagger – API documentation

@elysiajs/jwt – Authentication

@elysiajs/cors / @elysiajs/helmet – Security

pino – Production-grade logging

drizzle / prisma – Database layer
```
