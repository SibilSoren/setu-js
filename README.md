# Setu-js 🌉

> A "Shadcn for Backend" CLI that gives you **ownership** of production-ready Express.js code.

[![npm version](https://img.shields.io/npm/v/setu-js.svg)](https://www.npmjs.com/package/setu-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Philosophy

**Ownership over abstraction.** No hidden dependencies for core logic. Just clean, customizable TypeScript code that you own and can modify.

## Quick Start

```bash
# In your existing Express.js project
npx setu-js init

# Add components
npx setu-js add auth
npx setu-js add logger
npx setu-js add database
npx setu-js add security

# Generate routes
npx setu-js generate route users
npx setu-js generate route products
```

## Installation

```bash
# Using npm
npm install -g setu-js

# Using pnpm
pnpm add -g setu-js

# Using yarn
yarn global add setu-js

# Using bun
bun add -g setu-js

# Or run directly with npx
npx setu-js <command>
```

## Commands

### `setu init`

Initialize Setu in your project. Creates `setu.json` and base templates.

```bash
setu init          # Interactive mode
setu init --yes    # Use defaults
```

**Creates:**
- `setu.json` - Configuration file
- `lib/setu/error-handler.ts` - Global error handling
- `lib/setu/zod-middleware.ts` - Request validation

### `setu add <component>`

Add production-ready components to your project.

```bash
setu add auth       # JWT authentication
setu add logger     # Pino logging
setu add database   # Prisma setup
setu add security   # Rate limiting + Helmet
```

| Component | Description | Dependencies |
|-----------|-------------|--------------|
| `auth` | JWT with refresh tokens, cookie support | jsonwebtoken, bcryptjs, cookie-parser |
| `logger` | Structured logging with Pino | pino, pino-http, pino-pretty |
| `database` | Prisma ORM with singleton & utilities | @prisma/client |
| `security` | Rate limiting + Helmet headers | helmet, express-rate-limit |

### `setu generate route <name>`

Scaffold a complete CRUD route with controller and service.

```bash
setu generate route users
setu generate route products
setu g route orders  # 'g' is an alias
```

**Creates:**
- `routes/<name>.routes.ts` - Express router with CRUD endpoints
- `controllers/<name>.controller.ts` - Request handlers with validation
- `services/<name>.service.ts` - Business logic template

## Example Usage

After running `setu init` and `setu add auth`:

```typescript
// app.ts
import express from 'express';
import { errorHandler } from './lib/setu/error-handler';
import authRoutes from './lib/setu/auth/auth.routes';

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

app.listen(3000);
```

## Configuration

`setu.json` stores your project configuration:

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
