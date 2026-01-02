import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center flex-1 px-4 py-12">
      <div className="mb-6 text-6xl">🪛</div>
      <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
        Yantr-js Documentation
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-[600px]">
        The "Shadcn for Backend" CLI. High-quality Express.js code you own, not a library you fight.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/docs" 
          className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium text-lg hover:opacity-90 transition-opacity"
        >
          Get Started
        </Link>
        <Link 
          href="https://github.com/SibilSoren/yantr-js" 
          target="_blank"
          className="bg-muted text-muted-foreground px-8 py-3 rounded-md font-medium text-lg hover:bg-muted/80 transition-colors"
        >
          GitHub
        </Link>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1000px] text-left">
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="font-bold mb-2">Ownership</h3>
          <p className="text-sm text-muted-foreground">The code is injected directly into your project. You own the implementation.</p>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="font-bold mb-2">Production-Ready</h3>
          <p className="text-sm text-muted-foreground">Pre-configured with industry standard patterns for auth, logging, and security.</p>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="font-bold mb-2">Framework Agnosticish</h3>
          <p className="text-sm text-muted-foreground">Optimized for Express.js, but the logic is pure TypeScript.</p>
        </div>
      </div>
    </div>
  );
}
