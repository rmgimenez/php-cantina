import {
  adicionarObservacaoAluno,
  inativarObservacaoAluno,
  obterAlunoPorRA,
  obterAlunosAtivos,
  obterObservacoesAluno,
  obterObservacoesAlunoFull,
} from '@/lib/alunos';
import { verifyToken } from '@/lib/auth/tokens';
import { listarProdutos } from '@/lib/produtos';
import {
  buscarEstatisticasVendas,
  buscarFuncionarioPorCodigo,
  buscarFuncionariosEscola,
  buscarVendas,
  criarVenda,
  NovaVenda,
  verificarCondicoesVenda,
} from '@/lib/vendas';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

    if (action === 'estatisticas') {
      const dataInicio = searchParams.get('dataInicio') || undefined;
      const dataFim = searchParams.get('dataFim') || undefined;

      const estatisticas = await buscarEstatisticasVendas(dataInicio, dataFim);
      return NextResponse.json({ success: true, data: estatisticas });
    }

    if (action === 'produtos') {
      const produtos = await listarProdutos({ incluirInativos: false });
      const produtosAtivos = produtos.filter((p: any) => p.ativo && p.estoqueAtual > 0);
      return NextResponse.json({ success: true, data: produtosAtivos });
    }

    if (action === 'alunos') {
      const nome = searchParams.get('nome');
      if (nome) {
        const { buscarAlunosPorNome } = await import('@/lib/alunos');
        const alunos = await buscarAlunosPorNome(nome);
        return NextResponse.json({ success: true, data: alunos });
      } else {
        const alunos = await obterAlunosAtivos();
        return NextResponse.json({ success: true, data: alunos });
      }
    }

    if (action === 'funcionarios') {
      const nome = searchParams.get('nome') || undefined;
      const funcionarios = await buscarFuncionariosEscola(nome);
      return NextResponse.json({ success: true, data: funcionarios });
    }

    if (action === 'aluno') {
      const ra = searchParams.get('ra');
      if (!ra) {
        return NextResponse.json({ error: 'RA é obrigatório' }, { status: 400 });
      }

      const aluno = await obterAlunoPorRA(parseInt(ra));
      if (!aluno) {
        return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
      }
      // Buscar observações públicas para o aluno
      const observacoes = await obterObservacoesAluno(parseInt(ra));

      return NextResponse.json({ success: true, data: { aluno, observacoes } });
    }

    if (action === 'funcionario') {
      const codigo = searchParams.get('codigo');
      if (!codigo) {
        return NextResponse.json({ error: 'Código é obrigatório' }, { status: 400 });
      }

      const funcionario = await buscarFuncionarioPorCodigo(parseInt(codigo));
      if (!funcionario) {
        return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: funcionario });
    }

    if (action === 'verificar') {
      const tipoCliente = searchParams.get('tipoCliente') as 'aluno' | 'funcionario' | 'dinheiro';
      const valorTotal = parseFloat(searchParams.get('valorTotal') || '0');
      const clienteId = searchParams.get('clienteId')
        ? parseInt(searchParams.get('clienteId')!)
        : undefined;

      if (!tipoCliente || !valorTotal) {
        return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
      }

      const verificacao = await verificarCondicoesVenda(tipoCliente, valorTotal, clienteId);
      return NextResponse.json({ success: true, data: verificacao });
    }

    if (action === 'adicionarObservacao') {
      const ra = searchParams.get('ra');
      const texto = searchParams.get('texto');
      const publico = searchParams.get('publico') !== 'false';

      if (!ra || !texto) {
        return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
      }

      // usuário atual será o funcionário que criou a observação
      const user = await getCurrentUser();
      const funcionarioId = user ? user.id : null;

      const ok = await adicionarObservacaoAluno(parseInt(ra), texto, funcionarioId, publico);
      if (!ok) {
        return NextResponse.json({ error: 'Erro ao adicionar observação' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Observação adicionada' });
    }

    if (action === 'observacoesFull') {
      const ra = searchParams.get('ra');
      if (!ra) return NextResponse.json({ error: 'RA é obrigatório' }, { status: 400 });
      const historico = await obterObservacoesAlunoFull(parseInt(ra));
      return NextResponse.json({ success: true, data: historico });
    }

    if (action === 'inativarObservacao') {
      const id = searchParams.get('id');
      if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
      const ok = await inativarObservacaoAluno(parseInt(id));
      if (!ok) return NextResponse.json({ error: 'Falha ao inativar' }, { status: 500 });
      return NextResponse.json({ success: true, message: 'Observação inativada' });
    }

    // Buscar vendas com filtros
    const dataInicio = searchParams.get('dataInicio') || undefined;
    const dataFim = searchParams.get('dataFim') || undefined;
    const tipoCliente = searchParams.get('tipoCliente') || undefined;
    const funcionarioCantina = searchParams.get('funcionarioCantina')
      ? parseInt(searchParams.get('funcionarioCantina')!)
      : undefined;
    const limite = parseInt(searchParams.get('limite') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const vendas = await buscarVendas(
      dataInicio,
      dataFim,
      tipoCliente,
      funcionarioCantina,
      limite,
      offset
    );

    return NextResponse.json({ success: true, data: vendas });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar permissões (atendente ou administrador podem fazer vendas)
    if (!['administrador', 'atendente'].includes(user.role)) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    const body = await request.json();

    // Validar dados obrigatórios
    if (
      !body.tipoCliente ||
      !body.valorTotal ||
      !body.formaPagamento ||
      !body.itens ||
      body.itens.length === 0
    ) {
      return NextResponse.json(
        {
          error: 'Dados obrigatórios: tipoCliente, valorTotal, formaPagamento, itens',
        },
        { status: 400 }
      );
    }

    // Validar tipo de cliente e IDs correspondentes
    if (body.tipoCliente === 'aluno' && !body.raAluno) {
      return NextResponse.json({ error: 'RA do aluno é obrigatório' }, { status: 400 });
    }

    if (body.tipoCliente === 'funcionario' && !body.codigoFuncionario) {
      return NextResponse.json({ error: 'Código do funcionário é obrigatório' }, { status: 400 });
    }

    if (
      body.formaPagamento === 'dinheiro' &&
      (!body.valorRecebido || body.valorRecebido < body.valorTotal)
    ) {
      return NextResponse.json(
        { error: 'Valor recebido deve ser informado e suficiente' },
        { status: 400 }
      );
    }

    // Calcular troco se necessário
    let valorTroco = 0;
    if (body.formaPagamento === 'dinheiro' && body.valorRecebido > body.valorTotal) {
      valorTroco = body.valorRecebido - body.valorTotal;
    }

    // Validar itens
    for (const item of body.itens) {
      if (!item.produtoId || !item.quantidade || !item.precoUnitario || !item.subtotal) {
        return NextResponse.json(
          {
            error: 'Todos os itens devem ter produtoId, quantidade, precoUnitario e subtotal',
          },
          { status: 400 }
        );
      }

      // Verificar se o subtotal está correto
      const subtotalCalculado = item.quantidade * item.precoUnitario;
      if (Math.abs(subtotalCalculado - item.subtotal) > 0.01) {
        return NextResponse.json(
          {
            error: `Subtotal incorreto para o produto ${item.nomeProduto}`,
          },
          { status: 400 }
        );
      }
    }

    // Verificar se o valor total está correto
    const valorTotalCalculado = body.itens.reduce(
      (total: number, item: any) => total + item.subtotal,
      0
    );
    if (Math.abs(valorTotalCalculado - body.valorTotal) > 0.01) {
      return NextResponse.json(
        {
          error: 'Valor total não confere com a soma dos itens',
        },
        { status: 400 }
      );
    }

    const novaVenda: NovaVenda = {
      tipoCliente: body.tipoCliente,
      raAluno: body.raAluno,
      codigoFuncionario: body.codigoFuncionario,
      funcionarioCantina: user.id,
      valorTotal: body.valorTotal,
      formaPagamento: body.formaPagamento,
      valorRecebido: body.valorRecebido,
      valorTroco,
      observacoes: body.observacoes,
      itens: body.itens,
    };

    const vendaId = await criarVenda(novaVenda);

    return NextResponse.json({
      success: true,
      message: 'Venda realizada com sucesso',
      data: { vendaId, valorTroco },
    });
  } catch (error: any) {
    console.error('Erro ao criar venda:', error);

    // Se for um erro de validação/negócio, retornar a mensagem específica
    if (error.message && !error.message.includes('server')) {
      const payload: any = { error: error.message };
      if (error.observacoesAluno) payload.observacoes = error.observacoesAluno;
      return NextResponse.json(payload, { status: 400 });
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
