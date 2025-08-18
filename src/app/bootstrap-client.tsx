'use client';
import { useEffect } from 'react';

export default function BootstrapClient(): null {
  useEffect(() => {
    // carregar dinamicamente apenas no client para evitar execução durante SSR
    void import('bootstrap/dist/js/bootstrap.bundle');
  }, []);

  return null;
}
