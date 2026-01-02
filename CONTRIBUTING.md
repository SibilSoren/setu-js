# Contributing to Setu-js

Thank you for your interest in contributing to Setu-js! 🌉

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/setu-js.git
   cd setu-js
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd cli && npm install
   cd ../docs && npm install
   ```

3. **Build the CLI**
   ```bash
   cd cli
   npm run build
   ```

4. **Test locally**
   ```bash
   node dist/index.js --help
   ```

## Project Structure

```
setu-js/
├── cli/                 # CLI package
│   ├── src/            # TypeScript source
│   └── registry/       # Component templates
├── docs/               # Documentation site (Fumadocs)
└── .github/            # GitHub workflows
```

## Making Changes

1. Create a feature branch from `develop`
   ```bash
   git checkout develop
   git checkout -b feature/your-feature
   ```

2. Make your changes and test

3. Commit with conventional commits
   ```bash
   git commit -m "feat: add new component"
   git commit -m "fix: resolve issue with init"
   ```

4. Push and create a PR against `develop`

## Adding New Components

1. Add template files to `cli/registry/templates/<component>/`
2. Update `cli/registry/registry.json` with component metadata
3. Add usage hints in `cli/src/commands/add.ts`
4. Test with `setu add <component>`

## Code Style

- Use TypeScript
- Follow existing code patterns
- Run `npm run lint` before committing

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
