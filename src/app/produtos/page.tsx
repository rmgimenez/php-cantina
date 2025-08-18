import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '../../lib/auth/tokens';
import ProdutosClient from './produtos-client';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('cant_token')?.value;
  if (!token) return null;
  try {
    return verifyToken(token) as any;
  } catch {
    return null;
  }
}

export default async function ProdutosPage() {
  const user = await getUser();
  if (!user) redirect('/login');
  return <ProdutosClient user={user} />;
}
