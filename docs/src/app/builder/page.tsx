'use client';

import { useState } from 'react';
import Image from 'next/image';

// Skill Icons CDN URLs
const ICONS = {
  express: 'https://skillicons.dev/icons?i=express',
  hono: 'https://r2.better-t-stack.dev/icons/hono.svg',
  fastify: 'https://r2.better-t-stack.dev/icons/fastify.svg',
  bun: 'https://r2.better-t-stack.dev/icons/bun.svg',
  postgres: 'https://skillicons.dev/icons?i=postgres',
  mongodb: 'https://skillicons.dev/icons?i=mongodb',
  prisma: 'https://skillicons.dev/icons?i=prisma',
  drizzle: 'https://r2.better-t-stack.dev/icons/drizzle.svg',
  mysql: 'https://skillicons.dev/icons?i=mysql',
  sqlite: 'https://skillicons.dev/icons?i=sqlite',
  mongoose: 'https://r2.better-t-stack.dev/icons/mongoose.svg',
  jwt: 'https://www.jwt.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fjwt-flower.f20616b0.png&w=1920&q=75',
  pino: 'https://getpino.io/pino-tree.png',
  security: 'https://cdn-icons-png.flaticon.com/512/1821/1821790.png',
};

type Framework = 'express' | 'hono' | 'fastify';
type Runtime = 'node' | 'bun';
type Database = 'postgres' | 'mongodb' | 'none';
type Orm = 'prisma' | 'drizzle' | 'mongoose' | 'none';
type Component = 'auth' | 'logger' | 'security';

interface OptionCardProps {
  label: string;
  description?: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
  isDefault?: boolean;
}

function OptionCard({ label, description, icon, selected, onClick, isDefault }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
        hover:scale-[1.02] active:scale-[0.98]
        ${selected 
          ? 'border-[#4a9eff] bg-[#4a9eff]/10 dark:bg-[#4a9eff]/10 shadow-[0_0_20px_rgba(74,158,255,0.1)]' 
          : 'border-fd-border bg-fd-card hover:border-fd-primary/50 hover:bg-fd-muted'
        }
      `}
    >
      {isDefault && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#4a9eff] text-[10px] font-bold rounded text-white uppercase tracking-wider shadow-lg">
          Default
        </span>
      )}
      {icon && (
        <div className="shrink-0 transition-transform group-hover:scale-110">
          <img src={icon} alt={label} className="w-10 h-10 rounded-lg shadow-md" />
        </div>
      )}
      {!icon && (
        <div className="shrink-0 w-10 h-10 rounded-lg bg-fd-muted flex items-center justify-center text-fd-muted-foreground text-lg font-bold group-hover:bg-fd-accent transition-colors">
          {label[0]}
        </div>
      )}
      <div className="text-left min-w-0 pr-2">
        <div className="text-sm font-bold text-fd-foreground group-hover:text-[#4a9eff] transition-colors flex items-center gap-2">
          {label}
        </div>
        {description && (
          <div className="text-xs text-fd-muted-foreground truncate group-hover:text-fd-foreground/70 transition-colors">{description}</div>
        )}
      </div>
      {selected && (
        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#4a9eff] rounded-full animate-pulse" />
      )}
    </button>
  );
}

export default function BuilderPage() {
  const [projectName, setProjectName] = useState('my-yantr-app');
  const [runtime, setRuntime] = useState<Runtime>('node');
  const [framework, setFramework] = useState<Framework>('express');
  const [database, setDatabase] = useState<Database>('postgres');
  const [orm, setOrm] = useState<Orm>('prisma');
  const [components, setComponents] = useState<Set<Component>>(new Set(['auth']));
  const [copied, setCopied] = useState(false);

  const handleDatabaseChange = (db: Database) => {
    setDatabase(db);
    if (db === 'mongodb') {
      setOrm('mongoose');
    } else if (db === 'postgres') {
      setOrm('prisma');
    } else {
      setOrm('none');
    }
  };

  const toggleComponent = (comp: Component) => {
    const newSet = new Set(components);
    if (newSet.has(comp)) {
      newSet.delete(comp);
    } else {
      newSet.add(comp);
    }
    setComponents(newSet);
  };

  const generateCommand = () => {
    const lines: string[] = [];
    
    const initParts = ['npx yantr-js init'];
    initParts.push(`--framework ${framework}`);
    if (runtime === 'bun') {
      initParts.push('--runtime bun');
    }
    initParts.push('--yes');
    lines.push(initParts.join(' '));
    
    if (database !== 'none') {
      lines.push(`npx yantr-js add database --type ${database} --orm ${orm}`);
    }
    
    if (components.size > 0) {
      const comps = Array.from(components).join(' ');
      lines.push(`npx yantr-js add ${comps}`);
    }
    
    return lines.join(' && \\\n  ');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-fd-background text-fd-foreground selection:bg-[#4a9eff]/30">
      <main className="max-w-[1440px] mx-auto px-8 py-10">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-start">
          
          {/* Left Panel - Options */}
          <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-700">
            {/* Runtime */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-[#4a9eff] rounded-full shadow-[0_0_15px_rgba(74,158,255,0.5)]" />
                <h2 className="text-lg font-bold text-fd-foreground tracking-tight flex items-center gap-2">
                  <span className="text-fd-muted-foreground font-mono text-sm">01.</span> Runtime
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OptionCard
                  label="Node.js"
                  description="Standard runtime"
                  icon="https://skillicons.dev/icons?i=nodejs"
                  selected={runtime === 'node'}
                  onClick={() => setRuntime('node')}
                  isDefault
                />
                <OptionCard
                  label="Bun"
                  description="Fast all-in-one"
                  icon={ICONS.bun}
                  selected={runtime === 'bun'}
                  onClick={() => setRuntime('bun')}
                />
              </div>
            </section>

            {/* Framework */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-[#4a9eff] rounded-full shadow-[0_0_15px_rgba(74,158,255,0.5)]" />
                <h2 className="text-lg font-bold text-fd-foreground tracking-tight flex items-center gap-2">
                  <span className="text-fd-muted-foreground font-mono text-sm">02.</span> Framework
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OptionCard
                  label="Express.js"
                  description="Classic & Flexible"
                  icon={ICONS.express}
                  selected={framework === 'express'}
                  onClick={() => setFramework('express')}
                  isDefault
                />
                <OptionCard
                  label="Hono"
                  description="Ultrafast multi-runtime"
                  icon={ICONS.hono}
                  selected={framework === 'hono'}
                  onClick={() => setFramework('hono')}
                />
                <OptionCard
                  label="Fastify"
                  description="High throughput"
                  icon={ICONS.fastify}
                  selected={framework === 'fastify'}
                  onClick={() => setFramework('fastify')}
                />
              </div>
            </section>

            {/* Database */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-[#4a9eff] rounded-full shadow-[0_0_15px_rgba(74,158,255,0.5)]" />
                <h2 className="text-lg font-bold text-fd-foreground tracking-tight flex items-center gap-2">
                  <span className="text-fd-muted-foreground font-mono text-sm">03.</span> Database
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OptionCard
                  label="PostgreSQL"
                  description="Relational DB"
                  icon={ICONS.postgres}
                  selected={database === 'postgres'}
                  onClick={() => handleDatabaseChange('postgres')}
                  isDefault
                />
                <OptionCard
                  label="MongoDB"
                  description="NoSQL Document DB"
                  icon={ICONS.mongodb}
                  selected={database === 'mongodb'}
                  onClick={() => handleDatabaseChange('mongodb')}
                />
                <OptionCard
                  label="No Database"
                  description="Stateless app"
                  selected={database === 'none'}
                  onClick={() => handleDatabaseChange('none')}
                />
              </div>
            </section>

            {/* ORM */}
            {database !== 'none' && (
              <section className="animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-[#4a9eff] rounded-full shadow-[0_0_15px_rgba(74,158,255,0.5)]" />
                  <h2 className="text-lg font-bold text-fd-foreground tracking-tight flex items-center gap-2">
                    <span className="text-fd-muted-foreground font-mono text-sm">04.</span> ORM
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {database === 'postgres' && (
                    <>
                      <OptionCard
                        label="Prisma"
                        description="Auto-gen client"
                        icon={ICONS.prisma}
                        selected={orm === 'prisma'}
                        onClick={() => setOrm('prisma')}
                        isDefault
                      />
                      <OptionCard
                        label="Drizzle"
                        description="Type-safe SQL"
                        icon={ICONS.drizzle}
                        selected={orm === 'drizzle'}
                        onClick={() => setOrm('drizzle')}
                      />
                    </>
                  )}
                  {database === 'mongodb' && (
                    <OptionCard
                      label="Mongoose"
                      description="Schema modeling"
                      icon={ICONS.mongoose}
                      selected={orm === 'mongoose'}
                      onClick={() => setOrm('mongoose')}
                      isDefault
                    />
                  )}
                </div>
              </section>
            )}

            {/* Components */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-[#4a9eff] rounded-full shadow-[0_0_15px_rgba(74,158,255,0.5)]" />
                <h2 className="text-lg font-bold text-fd-foreground tracking-tight flex items-center gap-2">
                  <span className="text-fd-muted-foreground font-mono text-sm">05.</span> Components
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OptionCard
                  label="Authentication"
                  description="JWT auth setup"
                  icon={ICONS.jwt}
                  selected={components.has('auth')}
                  onClick={() => toggleComponent('auth')}
                />
                <OptionCard
                  label="Logger"
                  description="Pino logging"
                  icon={ICONS.pino}
                  selected={components.has('logger')}
                  onClick={() => toggleComponent('logger')}
                />
                <OptionCard
                  label="Security"
                  description="Rate limit + Helmet"
                  icon={ICONS.security}
                  selected={components.has('security')}
                  onClick={() => toggleComponent('security')}
                />
              </div>
            </section>
          </div>

          {/* Right Panel - Command Output (Sticky) */}
          <div className="sticky top-28 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Project Name Card */}
            <div className="bg-fd-card border border-fd-border p-6 rounded-2xl backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4a9eff]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#4a9eff]/10 transition-colors" />
              <label className="text-[11px] font-bold text-fd-muted-foreground mb-3 block uppercase tracking-widest">
                Project Identity
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-fd-background border border-fd-border rounded-xl text-fd-foreground focus:outline-none focus:border-[#4a9eff] transition-all placeholder:text-fd-muted-foreground font-medium"
                  placeholder="App name..."
                />
              </div>
            </div>

            {/* Command Preview Card */}
            <div className="bg-fd-card rounded-2xl border border-fd-border shadow-2xl shadow-[#4a9eff]/10 overflow-hidden group relative">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="bg-[#4a9eff] rounded-lg p-1 w-8 h-8 flex items-center justify-center">
                  <Image src="/logo.png" alt="YantrJS" width={16} height={16} className="brightness-0 invert" />
                </div>
              </div>
              <div className="bg-fd-muted px-5 py-3 border-b border-fd-border flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-[#4a9eff]/50" />
                </div>
                <span className="text-[10px] font-bold text-fd-muted-foreground uppercase tracking-widest">Terminal</span>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed min-h-[140px] flex items-center bg-slate-950 dark:bg-slate-950">
                <pre className="text-slate-300 break-all whitespace-pre-wrap">
                  <span className="text-[#4a9eff] mr-2">$</span>
                  {generateCommand()}
                </pre>
              </div>
              <div className="p-4 bg-fd-secondary/50 border-t border-fd-border">
                <button
                  onClick={copyToClipboard}
                  className={`
                    w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300
                    ${copied 
                      ? 'bg-[#4a9eff] text-white scale-[0.98]' 
                      : 'bg-white text-slate-900 hover:bg-[#4a9eff] hover:text-white hover:scale-[1.02]'
                    }
                  `}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Command
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stack Visualizer */}
            <div className="bg-fd-card/30 border border-fd-border/50 p-6 rounded-2xl">
              <label className="text-[11px] font-bold text-fd-muted-foreground mb-4 block uppercase tracking-widest">
                Selected Components
              </label>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 bg-fd-muted text-fd-muted-foreground border border-fd-border rounded-lg text-xs font-bold hover:border-[#4a9eff]/50 transition-colors">
                  {runtime}
                </div>
                <div className="px-3 py-1.5 bg-[#4a9eff]/10 text-[#4a9eff] border border-[#4a9eff]/20 rounded-lg text-xs font-bold transition-all hover:bg-[#4a9eff]/20">
                  {framework}
                </div>
                {database !== 'none' && (
                  <>
                    <div className="px-3 py-1.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold">
                      {database}
                    </div>
                    <div className="px-3 py-1.5 bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold">
                      {orm}
                    </div>
                  </>
                )}
                {Array.from(components).map(comp => (
                  <div key={comp} className="px-3 py-1.5 bg-[#e74c3c]/10 text-[#e74c3c] border border-[#e74c3c]/20 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {comp}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pro Tip */}
            <div className="p-4 bg-[#4a9eff]/5 border border-[#4a9eff]/10 rounded-2xl">
              <div className="flex gap-3">
                <span className="text-[#4a9eff] pt-0.5 select-none">💡</span>
                <p className="text-[11px] leading-relaxed text-fd-muted-foreground">
                  Copy this command and run it in your terminal to scaffold your entire backend in seconds with production-ready patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
