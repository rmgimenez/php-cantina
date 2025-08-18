import { parse } from 'cookie';
import { NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth/tokens';
import { criarProduto, listarProdutos } from '../../../lib/produtos';

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
  const search = searchParams.get('search') || null;
  const tipoParam = searchParams.get('tipo');
  const tipo = tipoParam ? Number(tipoParam) : null;
  const produtos = await listarProdutos({ incluirInativos, search, tipoProdutoId: tipo });
  return NextResponse.json({ data: produtos });
}

export async function POST(request: Request) {
  const user: any = autenticar(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!['administrador', 'estoquista'].includes(user.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { codigoBarras, nome, descricao, tipoProdutoId, preco, estoqueAtual, estoqueMinimo } =
      body || {};
    if (!nome || typeof nome !== 'string')
      return NextResponse.json({ error: 'nome_required' }, { status: 400 });
    if (!tipoProdutoId)
      return NextResponse.json({ error: 'tipoProdutoId_required' }, { status: 400 });
    const precoNumber = Number(preco);
    if (isNaN(precoNumber) || precoNumber < 0)
      return NextResponse.json({ error: 'preco_invalid' }, { status: 400 });
    const novo = await criarProduto({
      codigoBarras: codigoBarras ? String(codigoBarras) : undefined,
      nome: nome.trim(),
      descricao: descricao ? String(descricao) : undefined,
      tipoProdutoId: Number(tipoProdutoId),
      preco: precoNumber,
      estoqueAtual: estoqueAtual !== undefined ? Number(estoqueAtual) : 0,
      estoqueMinimo: estoqueMinimo !== undefined ? Number(estoqueMinimo) : 0,
    });
    return NextResponse.json({ data: novo }, { status: 201 });
  } catch (err: any) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'codigo_barras_duplicado' }, { status: 409 });
    }
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
