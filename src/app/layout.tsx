import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import BootstrapClient from './bootstrap-client';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cantina Escolar - Sistema de Gestão',
  description:
    'Sistema completo para gestão de cantina escolar - vendas, estoque e controle financeiro',
  keywords: 'cantina, escola, gestão, vendas, estoque, alunos',
  authors: [{ name: 'Sistema Cantina' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#253287',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-BR'>
      <head>
        <link
          rel='icon'
          href='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍽️</text></svg>'
        />
      </head>
      <body className={inter.className}>
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}
