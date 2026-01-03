<p align="center">
  <img src="docs/public/logo.png" alt="YantrJS Logo" width="120" height="120" />
</p>

<h1 align="center">YantrJS</h1>

<p align="center">
  <strong>The "Shadcn for Backend" CLI</strong><br/>
  Production-grade Express.js scaffolding with code you own, not a library you fight.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/yantr-js"><img src="https://img.shields.io/npm/v/yantr-js.svg" alt="npm version" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://yantrjs.vercel.app/docs"><img src="https://img.shields.io/badge/docs-yantrjs.vercel.app-blue" alt="Documentation" /></a>
</p>

<p align="center">
  <a href="https://yantrjs.vercel.app/docs">📖 Documentation</a> •
  <a href="#quick-start">🚀 Quick Start</a> •
  <a href="#components">📦 Components</a> •
  <a href="#contributing">🤝 Contributing</a>
</p>

---

## Philosophy

**Ownership over abstraction.** No hidden dependencies for core logic. Just clean, customizable TypeScript code that you own and can modify.

- **You own the code** — Injected directly into your project
- **Type-safe** — Built with TypeScript and Zod
- **Production-ready** — Battle-tested patterns
- **Zero lock-in** — No framework dependencies

---

## Quick Start

```bash
# Initialize in your project directory
npx yantr-js init

# Add components
npx yantr-js add auth
npx yantr-js add database

# Generate routes
npx yantr-js generate route users
```

> **Full documentation:** [yantrjs.vercel.app/docs](https://yantrjs.vercel.app/docs)

---

## Visual Builder

Configure your backend stack visually with our interactive builder:

**[yantrjs.vercel.app/builder](https://yantrjs.vercel.app/builder)**

Select your framework, runtime, database, ORM, and components — then copy the generated CLI commands.

---

## Installation

```bash
# Using npm
npm install -g yantr-js

# Using pnpm
pnpm add -g yantr-js

# Using yarn
yarn global add yantr-js

# Using bun
bun add -g yantr-js

# Or run directly with npx
npx yantr-js <command>
```

---

## Frameworks

YantrJS supports multiple backend frameworks:

| Framework | Description |
|-----------|-------------|
| **Express.js** | Classic and flexible (default) |
| **Hono** | Ultrafast multi-runtime framework |
| **Fastify** | High throughput and low overhead |

```bash
yantr init --framework express  # or hono, fastify
```

---

## Runtimes

Choose your preferred JavaScript runtime:

| Runtime | Description |
|---------|-------------|
| **Node.js** | Standard runtime (default) |
| **Bun** | Fast all-in-one runtime |

```bash
yantr init --runtime bun
```

---

## Commands

### `yantr init`

Initialize YantrJS in your project. Creates `yantr.json` and base templates.

```bash
yantr init                      # Interactive mode
yantr init --yes                # Use defaults
yantr init --framework hono     # Specify framework
yantr init --runtime bun        # Specify runtime
```

### `yantr add <component>`

Add production-ready components to your project.

```bash
yantr add auth       # JWT authentication
yantr add logger     # Pino logging
yantr add database   # Database setup with ORM
yantr add security   # Rate limiting + Helmet
```

### `yantr generate route <name>`

Scaffold a complete CRUD route with controller and service.

```bash
yantr generate route users
yantr g route orders  # 'g' is an alias
```

---

## Components

| Component | Description | Dependencies |
|-----------|-------------|--------------|
| `auth` | JWT with refresh tokens, cookie support | jsonwebtoken, bcryptjs, cookie-parser |
| `logger` | Structured logging with Pino | pino, pino-http, pino-pretty |
| `database` | Database setup with ORM choice | Prisma, Drizzle, or Mongoose |
| `security` | Rate limiting + Helmet headers | helmet, express-rate-limit |

### Database Options

| Database | ORM Options |
|----------|-------------|
| PostgreSQL | Prisma (default), Drizzle |
| MongoDB | Mongoose |

```bash
yantr add database --type postgres --orm prisma
yantr add database --type postgres --orm drizzle
yantr add database --type mongodb --orm mongoose
```

---

## Example Usage

After running `yantr init` and `yantr add auth`:

```typescript
// app.ts
import express from 'express';
import { errorHandler } from './lib/yantr/error-handler';
import authRoutes from './lib/yantr/auth/auth.routes';

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

app.listen(3000);
```

---

## Configuration

`yantr.json` stores your project configuration:

```json
{
  "$schema": "https://raw.githubusercontent.com/SibilSoren/yantr-js/main/cli/schema.json",
  "projectName": "my-yantr-api",
  "framework": "express",
  "runtime": "node",
  "srcDir": "./src",
  "packageManager": "pnpm",
  "installedComponents": ["base", "auth"]
}
```

---

## Package Manager Support

YantrJS automatically detects and uses your preferred package manager:

- npm
- pnpm
- yarn
- bun

---

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md).

---

## License

MIT © [SibilSoren](https://github.com/SibilSoren)

---

<p align="center">
  Built by the YantrJS team
</p>
