import { parse } from 'cookie';
import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth/tokens';
import { atualizarProduto, inativarProduto, obterProduto } from '../../../../lib/produtos';

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
  const produto = await obterProduto(id);
  if (!produto) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ data: produto });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user: any = autenticar(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!['administrador', 'estoquista'].includes(user.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const id = Number(params.id);
  const produto = await obterProduto(id);
  if (!produto) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  try {
    const body = await request.json();
    if (body.preco !== undefined) {
      const precoNumber = Number(body.preco);
      if (isNaN(precoNumber) || precoNumber < 0)
        return NextResponse.json({ error: 'preco_invalid' }, { status: 400 });
      body.preco = precoNumber;
    }
    if (body.estoqueAtual !== undefined) body.estoqueAtual = Number(body.estoqueAtual);
    if (body.estoqueMinimo !== undefined) body.estoqueMinimo = Number(body.estoqueMinimo);
    const atualizado = await atualizarProduto(id, body);
    return NextResponse.json({ data: atualizado });
  } catch (err: any) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'codigo_barras_duplicado' }, { status: 409 });
    }
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
  const produto = await obterProduto(id);
  if (!produto) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const inativado = await inativarProduto(id);
  return NextResponse.json({ data: inativado });
}
