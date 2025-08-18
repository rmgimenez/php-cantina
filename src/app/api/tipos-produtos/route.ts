import { parse } from 'cookie';
import { NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth/tokens';
import { criarTipoProduto, listarTiposProdutos } from '../../../lib/tipos-produtos';

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

export async function GET(request: Request) {
  const user = autenticar(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const incluirInativos = searchParams.get('inativos') === '1';
  const tipos = await listarTiposProdutos({ incluirInativos });
  return NextResponse.json({ data: tipos });
}

export async function POST(request: Request) {
  const user: any = autenticar(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!['administrador', 'estoquista'].includes(user.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { nome, descricao } = body;
    if (!nome || typeof nome !== 'string') {
      return NextResponse.json({ error: 'nome_required' }, { status: 400 });
    }
    const novo = await criarTipoProduto({
      nome: nome.trim(),
      descricao: descricao ? String(descricao) : undefined,
    });
    return NextResponse.json({ data: novo }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
