import { verifyToken } from '@/lib/auth/tokens';
import { criarRestricaoAluno, listarRestricoesPorAluno } from '@/lib/restricoes';
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

export async function GET(request: NextRequest) {
  const user = autenticar(request as any);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const ra = searchParams.get('ra');
  if (!ra) return NextResponse.json({ error: 'ra_required' }, { status: 400 });

  const lista = await listarRestricoesPorAluno(parseInt(ra));
  return NextResponse.json({ success: true, data: lista });
}

export async function POST(request: NextRequest) {
  const user = autenticar(request as any);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!['administrador', 'atendente'].includes(user.role))
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const body = await request.json();
    const { ra, tipo, produtoId, tipoProdutoId, permitido } = body;
    if (!ra || !tipo) return NextResponse.json({ error: 'params_missing' }, { status: 400 });

    const nova = await criarRestricaoAluno(
      parseInt(ra),
      tipo,
      produtoId || null,
      tipoProdutoId || null,
      !!permitido
    );
    return NextResponse.json({ success: true, data: nova }, { status: 201 });
  } catch (err) {
    console.error('Erro criar restrição:', err);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
