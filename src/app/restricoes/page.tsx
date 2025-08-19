import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '../../components/layout/navbar';
import { verifyToken } from '../../lib/auth/tokens';
import RestricoesClient from './restricoes-client';

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

export default async function RestricoesPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  // Apenas administradores e atendentes podem acessar
  if (user.role !== 'administrador' && user.role !== 'atendente') {
    redirect('/dashboard');
  }

  return (
    <>
      <Navbar user={user} />
      <RestricoesClient />
    </>
  );
}
