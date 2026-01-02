# Yantr-js 🪛

> A "Shadcn for Backend" CLI that gives you **ownership** of production-ready Express.js code.

[![npm version](https://img.shields.io/npm/v/yantr-js.svg)](https://www.npmjs.com/package/yantr-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Philosophy

**Ownership over abstraction.** No hidden dependencies for core logic. Just clean, customizable TypeScript code that you own and can modify.

## Quick Start

```bash
# In your existing Express.js project
npx yantr-js init

# Add components
npx yantr-js add auth
npx yantr-js add logger
npx yantr-js add database
npx yantr-js add security

# Generate routes
npx yantr-js generate route users
npx yantr-js generate route products
```

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

## Commands

### `yantr init`

Initialize Yantr in your project. Creates `yantr.json` and base templates.

```bash
yantr init          # Interactive mode
yantr init --yes    # Use defaults
```

**Creates:**
- `yantr.json` - Configuration file
- `lib/yantr/error-handler.ts` - Global error handling
- `lib/yantr/zod-middleware.ts` - Request validation

### `yantr add <component>`

Add production-ready components to your project.

```bash
yantr add auth       # JWT authentication
yantr add logger     # Pino logging
yantr add database   # Prisma setup
yantr add security   # Rate limiting + Helmet
```

| Component | Description | Dependencies |
|-----------|-------------|--------------|
| `auth` | JWT with refresh tokens, cookie support | jsonwebtoken, bcryptjs, cookie-parser |
| `logger` | Structured logging with Pino | pino, pino-http, pino-pretty |
| `database` | Prisma ORM with singleton & utilities | @prisma/client |
| `security` | Rate limiting + Helmet headers | helmet, express-rate-limit |

### `yantr generate route <name>`

Scaffold a complete CRUD route with controller and service.

```bash
yantr generate route users
yantr generate route products
yantr g route orders  # 'g' is an alias
```

**Creates:**
- `routes/<name>.routes.ts` - Express router with CRUD endpoints
- `controllers/<name>.controller.ts` - Request handlers with validation
- `services/<name>.service.ts` - Business logic template

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

## Configuration

`yantr.json` stores your project configuration:

```json
{
  "$schema": "https://raw.githubusercontent.com/SibilSoren/setu-js/main/cli/schema.json",
  "projectName": "my-api",
  "srcDir": "./src",
  "packageManager": "pnpm",
  "installedComponents": ["base", "auth"]
}
```

## Package Manager Support

Setu-js automatically detects and uses your preferred package manager:
- npm
- pnpm
- yarn
- bun

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md).

## License

MIT © [SibilSoren](https://github.com/SibilSoren)

---

Built with ❤️ by the Setu-js community
