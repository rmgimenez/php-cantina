import { verifyToken } from '@/lib/auth/tokens';
import { inativarRestricao } from '@/lib/restricoes';
import { parse } from 'cookie';
import { NextRequest, NextResponse } from 'next/server';

function autenticar(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const cookies = parse(cookie);
  const token = cookies['cant_token'];
  if (!token) return null;
  try {
    return verifyToken(token) as any;
  } catch {
    return null;
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = autenticar(request as any);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!['administrador', 'atendente'].includes(user.role))
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const id = parseInt(params.id);
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });

  const ok = await inativarRestricao(id);
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
