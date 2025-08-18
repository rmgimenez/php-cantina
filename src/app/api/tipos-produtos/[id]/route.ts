import { parse } from 'cookie';
import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth/tokens';
import {
  atualizarTipoProduto,
  inativarTipoProduto,
  obterTipoProduto,
} from '../../../../lib/tipos-produtos';

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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = autenticar(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = Number(params.id);
  const tipo = await obterTipoProduto(id);
  if (!tipo) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ data: tipo });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user: any = autenticar(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!['administrador', 'estoquista'].includes(user.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const id = Number(params.id);
  const tipo = await obterTipoProduto(id);
  if (!tipo) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  try {
    const body = await request.json();
    const atualizado = await atualizarTipoProduto(id, {
      nome: body.nome,
      descricao: body.descricao,
    });
    return NextResponse.json({ data: atualizado });
  } catch (err) {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user: any = autenticar(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!['administrador', 'estoquista'].includes(user.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const id = Number(params.id);
  const tipo = await obterTipoProduto(id);
  if (!tipo) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const inativado = await inativarTipoProduto(id);
  return NextResponse.json({ data: inativado });
}
