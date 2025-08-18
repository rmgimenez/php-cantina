import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '../../components/layout/navbar';
import { verifyToken } from '../../lib/auth/tokens';
import EstoqueClient from './estoque-client';

export const metadata: Metadata = {
  title: 'Controle de Estoque | Sistema Cantina',
  description: 'Gerencie o estoque de produtos da cantina escolar',
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

export default async function EstoquePage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <Navbar user={user} />
      <div className='container py-4'>
        <div className='row mb-4'>
          <div className='col-12'>
            <div className='card dashboard-card'>
              <div className='card-body text-center py-3'>
                <h1 className='h4 mb-1 text-primary'>Controle de Estoque</h1>
                <p className='text-muted mb-0'>
                  Gerencie movimentações e histórico de produtos. Você está logado como{' '}
                  <strong>{user.username}</strong>{' '}
                  <span className='badge bg-primary ms-2'>{user.role}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <EstoqueClient />
      </div>
    </>
  );
}
