import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '../../components/layout/navbar';
import { verifyToken } from '../../lib/auth/tokens';
import AlunosClient from './alunos-client';

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

export default async function AlunosPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  return (
    <>
      <Navbar user={user} />
      <div className='container py-4'>
        <AlunosClient />
      </div>
    </>
  );
}
