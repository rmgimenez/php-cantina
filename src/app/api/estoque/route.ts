import { parse } from 'cookie';
import { NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth/tokens';
import estoqueLib from '../../../lib/estoque';

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
  const produtoId = searchParams.get('produtoId');
  try {
    const hist = await estoqueLib.listarHistorico(produtoId ? Number(produtoId) : undefined);
    return NextResponse.json({ data: hist });
  } catch (err) {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user: any = autenticar(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!['administrador', 'estoquista'].includes(user.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { tipo, produtoId, quantidade, motivo, vendaId } = body || {};
    if (!tipo || !['entrada', 'saida', 'ajuste'].includes(tipo))
      return NextResponse.json({ error: 'tipo_invalid' }, { status: 400 });
    if (!produtoId) return NextResponse.json({ error: 'produtoId_required' }, { status: 400 });
    if (quantidade === undefined || isNaN(Number(quantidade)) || Number(quantidade) < 0)
      return NextResponse.json({ error: 'quantidade_invalid' }, { status: 400 });
    const funcionarioCantinaId = (user.id as number) || 0;
    let res;
    if (tipo === 'entrada') {
      res = await estoqueLib.registrarEntrada(
        Number(produtoId),
        Number(quantidade),
        funcionarioCantinaId,
        motivo || null,
        vendaId ? Number(vendaId) : null
      );
    } else if (tipo === 'saida') {
      res = await estoqueLib.registrarSaida(
        Number(produtoId),
        Number(quantidade),
        funcionarioCantinaId,
        motivo || null,
        vendaId ? Number(vendaId) : null
      );
    } else {
      // ajuste
      res = await estoqueLib.ajustarEstoque(
        Number(produtoId),
        Number(quantidade),
        funcionarioCantinaId,
        motivo || null
      );
    }
    return NextResponse.json({ data: res }, { status: 201 });
  } catch (err: any) {
    if (err && err.message) {
      if (err.message === 'produto_not_found')
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
      if (err.message === 'insufficient_stock')
        return NextResponse.json({ error: 'insufficient_stock' }, { status: 400 });
      if (err.message === 'quantidade_invalid')
        return NextResponse.json({ error: 'quantidade_invalid' }, { status: 400 });
      if (err.message === 'estoque_negative')
        return NextResponse.json({ error: 'estoque_negative' }, { status: 400 });
    }
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
