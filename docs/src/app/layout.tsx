import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | YantrJS',
    default: 'YantrJS - Shadcn for Backend',
  },
  description: 'Production-grade Express.js backend scaffolding CLI. High-quality code you own, not a library you fight.',
  icons: '/favicon.ico',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
