import Link from 'next/link';
import Image from 'next/image';
import { Terminal, Shield, Database, Zap, Code, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="hero-bg min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="YantrJS"
              width={120}
              height={120}
              className="logo-glow rounded-lg"
              priority
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-white">
            YantrJS
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-[700px]">
            The <span className="text-[rgb(74,158,255)] font-semibold">"Shadcn for Backend"</span> CLI
          </p>
          <p className="text-lg text-slate-400 mb-10 max-w-[600px]">
            High-quality Express.js code you own, not a library you fight.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/docs" className="btn-primary text-lg">
              Get Started
            </Link>
            <Link
              href="https://github.com/SibilSoren/yantr-js"
              target="_blank"
              className="btn-secondary text-lg"
            >
              View on GitHub
            </Link>
          </div>

          {/* Terminal Preview */}
          <div className="mt-16 w-full max-w-[600px]">
            <div className="terminal-preview text-left">
              <div className="terminal-header">
                <div className="terminal-dot terminal-dot-red"></div>
                <div className="terminal-dot terminal-dot-yellow"></div>
                <div className="terminal-dot terminal-dot-green"></div>
              </div>
              <div className="terminal-body">
                <div className="text-slate-500"># Initialize in your project</div>
                <div><span className="text-green-400">$</span> npx yantr-js init</div>
                <div className="mt-3 text-slate-500"># Add production-ready components</div>
                <div><span className="text-green-400">$</span> npx yantr-js add auth</div>
                <div><span className="text-green-400">$</span> npx yantr-js add database</div>
                <div className="mt-3 text-slate-500"># Generate CRUD routes</div>
                <div><span className="text-green-400">$</span> npx yantr-js generate route users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-[rgb(var(--fd-background))]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why YantrJS?
          </h2>
          <p className="text-center text-[rgb(var(--fd-muted-foreground))] mb-12 max-w-[600px] mx-auto">
            Production-ready backend scaffolding with patterns battle-tested in real applications.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="w-12 h-12 rounded-lg bg-[rgb(var(--yantr-blue))]/10 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-[rgb(var(--yantr-blue))]" />
              </div>
              <h3 className="font-bold text-lg mb-2">Full Ownership</h3>
              <p className="text-sm text-[rgb(var(--fd-muted-foreground))]">
                The code is injected directly into your project. No hidden dependencies—you own and control everything.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="w-12 h-12 rounded-lg bg-[rgb(var(--yantr-coral))]/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[rgb(var(--yantr-coral))]" />
              </div>
              <h3 className="font-bold text-lg mb-2">Production Ready</h3>
              <p className="text-sm text-[rgb(var(--fd-muted-foreground))]">
                Pre-configured with industry-standard patterns for authentication, logging, and security.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="w-12 h-12 rounded-lg bg-[rgb(var(--yantr-blue))]/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[rgb(var(--yantr-blue))]" />
              </div>
              <h3 className="font-bold text-lg mb-2">Type Safe</h3>
              <p className="text-sm text-[rgb(var(--fd-muted-foreground))]">
                Built from the ground up with TypeScript and Zod for robust, self-documenting code.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="w-12 h-12 rounded-lg bg-[rgb(var(--yantr-coral))]/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-[rgb(var(--yantr-coral))]" />
              </div>
              <h3 className="font-bold text-lg mb-2">JWT Authentication</h3>
              <p className="text-sm text-[rgb(var(--fd-muted-foreground))]">
                Complete auth flow with access tokens, refresh tokens, and secure cookie handling.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card">
              <div className="w-12 h-12 rounded-lg bg-[rgb(var(--yantr-blue))]/10 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-[rgb(var(--yantr-blue))]" />
              </div>
              <h3 className="font-bold text-lg mb-2">Prisma Integration</h3>
              <p className="text-sm text-[rgb(var(--fd-muted-foreground))]">
                Database setup with Prisma ORM, singleton client pattern, and utility helpers.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card">
              <div className="w-12 h-12 rounded-lg bg-[rgb(var(--yantr-coral))]/10 flex items-center justify-center mb-4">
                <Terminal className="w-6 h-6 text-[rgb(var(--yantr-coral))]" />
              </div>
              <h3 className="font-bold text-lg mb-2">CLI Scaffolding</h3>
              <p className="text-sm text-[rgb(var(--fd-muted-foreground))]">
                Generate routes, controllers, and services with a single command. No more boilerplate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[rgb(var(--fd-border))]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="YantrJS" width={24} height={24} className="rounded" />
            <span className="font-semibold">YantrJS</span>
          </div>
          <p className="text-sm text-[rgb(var(--fd-muted-foreground))]">
            Built with ❤️ by{' '}
            <a
              href="https://github.com/SibilSoren"
              target="_blank"
              className="text-[rgb(var(--yantr-blue))] hover:underline"
            >
              SibilSoren
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
