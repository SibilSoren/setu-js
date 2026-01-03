import Link from 'next/link';
import Image from 'next/image';
import { Shield, Database, Zap, Code, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-fd-background dark:bg-fd-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 flex flex-col items-center">
        {/* Hub and Spoke Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl aspect-square pointer-events-none opacity-30 dark:opacity-20">
          <svg viewBox="0 0 800 800" className="w-full h-full text-slate-300 dark:text-slate-700">
            <line x1="400" y1="400" x2="150" y2="250" stroke="currentColor" strokeWidth="1" />
            <line x1="400" y1="400" x2="650" y2="200" stroke="currentColor" strokeWidth="1" />
            <line x1="400" y1="400" x2="100" y2="500" stroke="currentColor" strokeWidth="1" />
            <line x1="400" y1="400" x2="700" y2="450" stroke="currentColor" strokeWidth="1" />
            <line x1="400" y1="400" x2="400" y2="150" stroke="currentColor" strokeWidth="1" />
            <line x1="400" y1="400" x2="400" y2="650" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Floating Icons */}
        <div className="relative w-full max-w-4xl h-[400px] mb-12">
          {/* Main Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-32 h-32 bg-[#4a9eff] rounded-[40px] shadow-[0_20px_60px_rgba(74,158,255,0.4)] flex items-center justify-center animate-pulse">
              <Image src="/logo.png" alt="YantrJS" width={80} height={80} />
            </div>
          </div>

          {/* Spokes */}
          <div className="absolute top-[10%] left-[15%] w-16 h-16 bg-[#4a9eff] rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '0s' }}>
            <img src="https://skillicons.dev/icons?i=express" alt="Express" width={32} height={32} />
          </div>
          <div className="absolute top-[0%] left-[45%] w-14 h-14 bg-[#f97316] text-white rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
            <Zap className="w-7 h-7" />
          </div>
          <div className="absolute top-[5%] right-[20%] w-18 h-18 bg-[#a855f7] text-white rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
            <Shield className="w-9 h-9" />
          </div>
          <div className="absolute bottom-[20%] left-[10%] w-20 h-20 bg-[#06b6d4] text-white rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
            <Database className="w-10 h-10" />
          </div>
          <div className="absolute bottom-[10%] right-[15%] w-16 h-16 bg-[#f59e0b] text-white rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
             <Code className="w-8 h-8" />
          </div>
        </div>

        {/* Text Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-10 tracking-tighter text-fd-foreground leading-[0.9]">
            The All-in-one <br />
            <span className="text-[#4a9eff]">Backend Tool</span>
          </h1>
          <p className="text-xl md:text-2xl text-fd-muted-foreground mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
            Production-ready Node.js scaffolding designed to <br className="hidden md:block" />
            perfectly fit your business needs. 
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-24">
            <Link href="/docs" className="bg-[#4a9eff] text-white px-10 py-5 rounded-full text-xl font-bold shadow-2xl shadow-[#4a9eff]/30 hover:scale-105 transition-all hover:shadow-[#4a9eff]/40 active:scale-95 flex items-center gap-2">
              Get Started <ChevronRight className="w-6 h-6" />
            </Link>
            <Link href="/builder" className="bg-fd-card text-fd-foreground px-10 py-5 rounded-full text-xl font-bold border border-fd-border hover:bg-fd-muted transition-all shadow-sm active:scale-95">
              Try Builder
            </Link>
          </div>

          {/* Terminal Integration */}
          <div className="w-full max-w-2xl mx-auto">
            <div className="terminal-preview text-left shadow-[0_30px_100px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/10">
              <div className="terminal-header bg-[#1e293b] border-b border-slate-700/50">
                <div className="terminal-dot terminal-dot-red opacity-75"></div>
                <div className="terminal-dot terminal-dot-yellow opacity-75"></div>
                <div className="terminal-dot terminal-dot-green opacity-75"></div>
              </div>
              <div className="terminal-body bg-[#0f172a] p-8">
                <div className="text-slate-500 font-mono italic mb-2">// Scaffold your backend instantly</div>
                <div className="flex items-center gap-3">
                  <span className="text-[#4a9eff] font-bold">$</span>
                  <span className="text-white font-mono text-base tracking-tight">npx yantr-js init</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[#4a9eff] font-bold">$</span>
                  <span className="text-white font-mono text-base tracking-tight">npx yantr-js add auth database</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Features */}
      <section className="py-32 px-4 bg-fd-muted/50 border-y border-fd-border overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6 group">
              <div className="w-14 h-14 rounded-2xl bg-[#4a9eff]/10 flex items-center justify-center text-[#4a9eff] group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-fd-foreground">Blazing Fast</h3>
              <p className="text-fd-muted-foreground leading-relaxed font-medium text-lg">Scaffold a complete, production-ready backend in under 60 seconds.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-fd-foreground">Security First</h3>
              <p className="text-fd-muted-foreground leading-relaxed font-medium text-lg">Pre-configured JWT, rate limiting, and security headers by default.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-fd-foreground">Type Safe</h3>
              <p className="text-fd-muted-foreground leading-relaxed font-medium text-lg">Deep TypeScript integration with Zod schemas for end-to-end safety.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-fd-border bg-fd-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="YantrJS" width={28} height={28} className="rounded" />
            <span className="font-bold text-xl text-fd-foreground tracking-tight">YantrJS</span>
          </div>
          <div className="flex items-center gap-10 text-sm font-semibold text-fd-muted-foreground">
            <Link href="/docs" className="hover:text-fd-foreground transition-colors">Documentation</Link>
            <Link href="/builder" className="hover:text-fd-foreground transition-colors">Builder</Link>
            <Link href="https://github.com/SibilSoren" target="_blank" className="hover:text-fd-foreground transition-colors">GitHub</Link>
          </div>
          <p className="text-sm font-medium text-fd-muted-foreground">© 2024 YantrJS. Built with integrity.</p>
        </div>
      </footer>
    </div>
  );
}
