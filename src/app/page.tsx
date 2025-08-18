import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '../lib/auth/tokens';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('cant_token')?.value;
  if (token) {
    try {
      verifyToken(token);
      redirect('/dashboard');
    } catch (err) {
      redirect('/login');
    }
  } else {
    redirect('/login');
  }
  return null; // nunca chega aqui devido ao redirect
}
