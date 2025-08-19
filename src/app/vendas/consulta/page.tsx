import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '../../../components/layout/navbar';
import { verifyToken } from '../../../lib/auth/tokens';
import ConsultaVendasClient from './consulta-client';

export const metadata: Metadata = {
  title: 'Consulta de Vendas - Sistema Cantina',
  description: 'Consulta e relatórios de vendas da cantina escolar',
};

type TokenPayload = {
  username: string;
  role: 'administrador' | 'atendente' | 'estoquista';
  iat?: number;
  exp?: number;
};

async function getUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('cant_token')?.value;
  if (!token) return null;
  try {
    const payload = verifyToken(token) as TokenPayload;
    return payload;
  } catch (err) {
    return null;
  }
}

export default async function ConsultaVendasPage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <Navbar user={user} />
      <div className='container-fluid py-4'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h1 className='h3 mb-0'>Consulta de Vendas</h1>
          <nav aria-label='breadcrumb'>
            <ol className='breadcrumb mb-0'>
              <li className='breadcrumb-item'>
                <a href='/dashboard'>Dashboard</a>
              </li>
              <li className='breadcrumb-item'>
                <a href='/vendas'>Vendas</a>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                Consulta
              </li>
            </ol>
          </nav>
        </div>

        <ConsultaVendasClient />
      </div>
    </>
  );
}
