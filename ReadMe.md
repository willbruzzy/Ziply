# Ziply

**AI-Assisted Website Generation for Nonprofit Organizations**

---

## Overview

Ziply is a SaaS platform that enables nonprofit organizations to generate professional, customizable websites without coding experience. Through a guided wizard, users select a nonprofit-focused template, enter organization details, and receive a complete, deployable website as a downloadable ZIP file.

This project is being developed as part of a **Computer Science Capstone** using modern full-stack and cloud technologies.

---

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | Next.js 14 (React, TypeScript, Tailwind CSS) |
| Backend        | Node.js, Express, TypeScript            |
| Database       | Azure Cosmos DB                         |
| File Storage   | Azure Blob Storage                      |
| Payments       | Stripe Checkout + Webhooks              |
| AI Enhancement | OpenAI GPT API                          |
| Hosting        | Microsoft Azure (App Service)           |
| CI/CD          | GitHub Actions                          |

---

## Project Structure

```
Ziply/
├── client/          # Next.js frontend application
├── server/          # Express backend API
├── docs/            # Project documentation (spec, plan)
├── .github/
│   └── workflows/   # GitHub Actions CI pipeline
├── package.json     # Root workspace scripts
└── ReadMe.md
```

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- A **Stripe** account (for payment integration, needed in Phase 1+)
- An **OpenAI** API key (for AI content enhancement, needed in Phase 1+)
- **Azure** account (for deployment, needed in Phase 1+)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/willbruzzy/Ziply.git
cd Ziply
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Set up environment variables

Copy the example files and fill in your values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

Edit each file with your credentials. Required variables:

**Server** (`server/.env`)

| Variable | Description |
| -------- | ----------- |
| `PORT` | Server port (default: 3001) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend URL (e.g. `http://localhost:3000`) |
| `COSMOS_DB_ENDPOINT` | Azure Cosmos DB endpoint URL |
| `COSMOS_DB_KEY` | Azure Cosmos DB access key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `OPENAI_API_KEY` | OpenAI API key (for content enhancement) |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |

**Client** (`client/.env.local`)

| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g. `http://localhost:3001`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (for Checkout) |

### 4. Run in development mode

Start both the client (port 3000) and server (port 3001) concurrently:

```bash
npm run dev
```

Or run them individually:

```bash
npm run dev:client   # Next.js on http://localhost:3000
npm run dev:server   # Express on http://localhost:3001
```

### 5. Build for production

```bash
npm run build
```

### 6. Lint

```bash
npm run lint
```

---

## Available Scripts

| Script              | Description                             |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Start client and server concurrently    |
| `npm run dev:client`| Start Next.js dev server                |
| `npm run dev:server`| Start Express dev server with hot reload|
| `npm run build`     | Build both client and server            |
| `npm run lint`      | Lint both client and server             |
| `npm run install:all`| Install dependencies for all packages  |

---

## Documentation

- [Product & Technical Specification](docs/spec.md)
- [Implementation Plan](docs/plan.md)

---

## Branching Strategy

- `main` — stable, production-ready code
- `develop` — integration branch for features
- `feature/<name>` — individual feature branches (branch from `develop`, merge back via PR)

---

## License

This project is developed for academic purposes as part of a Computer Science Capstone.


