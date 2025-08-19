import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth/tokens';
import {
  abrirCaixa,
  calcularTotaisCaixa,
  criarCaixa,
  fecharCaixa,
  getCaixas,
  getCaixasAbertas,
  getRelatoriosCaixa,
} from '../../../lib/caixa';

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cant_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'abertas') {
      const caixasAbertas = await getCaixasAbertas();
      return NextResponse.json({ success: true, data: caixasAbertas });
    }

    if (action === 'relatorios') {
      const dataInicio = searchParams.get('dataInicio') || undefined;
      const dataFim = searchParams.get('dataFim') || undefined;
      const caixaId = searchParams.get('caixaId')
        ? parseInt(searchParams.get('caixaId')!)
        : undefined;

      const relatorios = await getRelatoriosCaixa(dataInicio, dataFim, caixaId);
      return NextResponse.json({ success: true, data: relatorios });
    }

    if (action === 'totais') {
      const aberturaId = searchParams.get('aberturaId');
      if (!aberturaId) {
        return NextResponse.json({ error: 'ID da abertura é obrigatório' }, { status: 400 });
      }

      const totais = await calcularTotaisCaixa(parseInt(aberturaId));
      return NextResponse.json({ success: true, data: totais });
    }

    const caixas = await getCaixas();
    return NextResponse.json({ success: true, data: caixas });
  } catch (error) {
    console.error('Erro ao buscar caixas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verifica se tem permissão (atendente ou administrador)
    if (!['administrador', 'atendente'].includes(user.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'abrir') {
      const { caixa_id, saldo_inicial, observacoes } = body;

      if (!caixa_id || saldo_inicial === undefined) {
        return NextResponse.json({ error: 'Dados obrigatórios não informados' }, { status: 400 });
      }

      const aberturaId = await abrirCaixa(user.id, {
        caixa_id,
        saldo_inicial: parseFloat(saldo_inicial),
        observacoes,
      });

      return NextResponse.json({
        success: true,
        message: 'Caixa aberto com sucesso',
        data: { abertura_id: aberturaId },
      });
    }

    if (action === 'fechar') {
      const {
        abertura_id,
        saldo_final,
        total_dinheiro,
        total_cartao,
        total_pix,
        troco,
        observacoes,
      } = body;

      if (!abertura_id || saldo_final === undefined) {
        return NextResponse.json({ error: 'Dados obrigatórios não informados' }, { status: 400 });
      }

      const fechamentoId = await fecharCaixa(user.id, {
        abertura_id,
        saldo_final: parseFloat(saldo_final),
        total_dinheiro: total_dinheiro ? parseFloat(total_dinheiro) : undefined,
        total_cartao: total_cartao ? parseFloat(total_cartao) : undefined,
        total_pix: total_pix ? parseFloat(total_pix) : undefined,
        troco: troco ? parseFloat(troco) : undefined,
        observacoes,
      });

      return NextResponse.json({
        success: true,
        message: 'Caixa fechado com sucesso',
        data: { fechamento_id: fechamentoId },
      });
    }

    if (action === 'criar') {
      // Apenas administrador pode criar caixas
      if (user.role !== 'administrador') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }

      const { nome, descricao } = body;

      if (!nome) {
        return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
      }

      const caixaId = await criarCaixa(nome, descricao);

      return NextResponse.json({
        success: true,
        message: 'Caixa criado com sucesso',
        data: { caixa_id: caixaId },
      });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
