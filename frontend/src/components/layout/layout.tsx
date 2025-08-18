import { type ReactNode } from 'react';
import { ToastContainer } from '../ui/toast';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className='app-root d-flex flex-column min-vh-100 bg-light'>
      <Header />

      <div className='flex-fill d-flex app-content'>
        <Sidebar />
        <main className='flex-fill overflow-auto'>{children}</main>
      </div>

      <ToastContainer />
    </div>
  );
}
