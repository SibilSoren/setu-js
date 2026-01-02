# Setu-js 🌉

> A "Shadcn for Backend" CLI tool that provides ownership of production-ready code blocks for Express.js applications.

## Philosophy

**Ownership over abstraction.** No hidden `node_modules` for core logic. Just clean, copy-pasted, and pre-configured code that you can customize to your needs.

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
```

## Available Components

| Component | Description |
|-----------|-------------|
| `base` | Global error handler + Zod validation middleware |
| `auth` | JWT authentication with refresh tokens |
| `logger` | Structured logging with Pino |
| `database` | Prisma ORM setup with connection pooling |
| `security` | Rate limiting + Helmet security headers |

## Documentation

Visit [setu-js.dev](https://setu-js.dev) for full documentation.

## License

MIT © [SibilSoren](https://github.com/SibilSoren)
