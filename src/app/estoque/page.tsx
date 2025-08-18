import { Metadata } from 'next';
import EstoqueClient from './estoque-client';

export const metadata: Metadata = {
  title: 'Controle de Estoque | Sistema Cantina',
  description: 'Gerencie o estoque de produtos da cantina escolar',
};

export default function EstoquePage() {
  return <EstoqueClient />;
}
