import { type ReactNode } from 'react';
import { Header } from './header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-vh-100 bg-light">
      <Header />
      <main className="py-4">
        {children}
      </main>
    </div>
  );
}