import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from './db';

export interface ItemVenda {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  pacoteAlunoId?: number | null;
}

export interface NovaVenda {
  tipoCliente: 'aluno' | 'funcionario' | 'dinheiro';
  raAluno?: number;
  codigoFuncionario?: number;
  funcionarioCantina: number;
  valorTotal: number;
  formaPagamento: 'conta' | 'dinheiro' | 'cartao' | 'pix';
  valorRecebido?: number;
  valorTroco?: number;
  observacoes?: string;
  itens: ItemVenda[];
}

export interface Venda {
  id: number;
  numeroVenda: string;
  tipoCliente: 'aluno' | 'funcionario' | 'dinheiro';
  raAluno?: number;
  codigoFuncionario?: number;
  funcionarioCantina: number;
  valorTotal: number;
  formaPagamento: 'conta' | 'dinheiro' | 'cartao' | 'pix';
  valorRecebido?: number;
  valorTroco?: number;
  observacoes?: string;
  dataVenda: Date;
  nomeCliente?: string;
  itens?: ItemVendaCompleto[];
}

export interface ItemVendaCompleto {
  id: number;
  vendaId: number;
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  pacoteAlunoId?: number;
}

export interface VerificacaoVenda {
  podeVender: boolean;
  motivo?: string;
  saldoAtual?: number;
  limiteDiario?: number;
  gastoHoje?: number;
}

export async function gerarNumeroVenda(): Promise<string> {
  const connection = await pool.getConnection();
  try {
    // Forçar collation da sessão para evitar "Illegal mix of collations"
    // Alguns bancos/tables usam utf8mb4_0900_ai_ci e outros utf8mb4_unicode_ci.
    // Ajustamos a collation da conexão para uma compatível antes de chamar a procedure.
    await connection.execute("SET SESSION collation_connection = 'utf8mb4_unicode_ci'");

    await connection.execute('CALL sp_cant_gerar_numero_venda(@numero)');
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT @numero as numero_venda');
    return rows[0].numero_venda;
  } finally {
    connection.release();
  }
}

export async function verificarRestricaoAluno(
  raAluno: number,
  produtoId: number
): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.execute('CALL sp_cant_verificar_restricao_aluno(?, ?, @pode_consumir)', [
      raAluno,
      produtoId,
    ]);
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT @pode_consumir as pode_consumir'
    );
    return rows[0].pode_consumir === 1;
  } finally {
    connection.release();
  }
}

export async function verificarCondicoesVenda(
  tipoCliente: 'aluno' | 'funcionario' | 'dinheiro',
  valorTotal: number,
  clienteId?: number,
  itens?: ItemVenda[]
): Promise<VerificacaoVenda> {
  const connection = await pool.getConnection();
  try {
    if (tipoCliente === 'dinheiro') {
      return { podeVender: true };
    }

    if (tipoCliente === 'aluno' && clienteId) {
      // Verificar saldo do aluno
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT ca.saldo, ca.limite_diario,
                COALESCE(SUM(CASE WHEN DATE(v.data_venda) = CURDATE() THEN v.valor_total ELSE 0 END), 0) as gasto_hoje
         FROM cant_contas_alunos ca
         LEFT JOIN cant_vendas v ON v.ra_aluno = ca.ra_aluno AND v.forma_pagamento = 'conta'
         WHERE ca.ra_aluno = ? AND ca.ativo = 1
         GROUP BY ca.ra_aluno, ca.saldo, ca.limite_diario`,
        [clienteId]
      );

      const contaAluno = rows[0];
      if (!contaAluno) {
        return {
          podeVender: false,
          motivo: 'Aluno não possui conta ativa na cantina',
        };
      }

      if (contaAluno.saldo < valorTotal) {
        return {
          podeVender: false,
          motivo: 'Saldo insuficiente',
          saldoAtual: contaAluno.saldo,
        };
      }

      const gastoTotal = contaAluno.gasto_hoje + valorTotal;
      if (contaAluno.limite_diario && gastoTotal > contaAluno.limite_diario) {
        return {
          podeVender: false,
          motivo: 'Limite diário excedido',
          limiteDiario: contaAluno.limite_diario,
          gastoHoje: contaAluno.gasto_hoje,
        };
      }

      // Verificar restrições de produtos
      if (itens) {
        for (const item of itens) {
          const podeConsumir = await verificarRestricaoAluno(clienteId, item.produtoId);
          if (!podeConsumir) {
            return {
              podeVender: false,
              motivo: `Produto "${item.nomeProduto}" não permitido para este aluno`,
            };
          }
        }
      }

      return {
        podeVender: true,
        saldoAtual: contaAluno.saldo,
        limiteDiario: contaAluno.limite_diario,
        gastoHoje: contaAluno.gasto_hoje,
      };
    }

    if (tipoCliente === 'funcionario' && clienteId) {
      // Verificar se funcionário existe e criar conta mensal se necessário
      const mesReferencia = new Date().toISOString().slice(0, 7) + '-01';

      await connection.execute(
        `INSERT IGNORE INTO cant_contas_funcionarios (codigo_funcionario, mes_referencia, saldo, consumo_mes_atual)
         VALUES (?, ?, 0, 0)`,
        [clienteId, mesReferencia]
      );

      return { podeVender: true };
    }

    return {
      podeVender: false,
      motivo: 'Tipo de cliente inválido',
    };
  } finally {
    connection.release();
  }
}

export async function criarVenda(novaVenda: NovaVenda): Promise<number> {
  const connection = await pool.getConnection();

  await connection.beginTransaction();

  try {
    // Verificar condições antes da venda
    const verificacao = await verificarCondicoesVenda(
      novaVenda.tipoCliente,
      novaVenda.valorTotal,
      novaVenda.raAluno || novaVenda.codigoFuncionario,
      novaVenda.itens
    );

    if (!verificacao.podeVender) {
      throw new Error(verificacao.motivo || 'Venda não permitida');
    }

    // Gerar número da venda
    const numeroVenda = await gerarNumeroVenda();

    // Inserir venda
    const [vendaResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO cant_vendas (
        numero_venda, tipo_cliente, ra_aluno, codigo_funcionario, 
        funcionario_cantina_id, valor_total, forma_pagamento, 
        valor_recebido, valor_troco, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numeroVenda,
        novaVenda.tipoCliente,
        novaVenda.raAluno || null,
        novaVenda.codigoFuncionario || null,
        novaVenda.funcionarioCantina,
        novaVenda.valorTotal,
        novaVenda.formaPagamento,
        novaVenda.valorRecebido || null,
        novaVenda.valorTroco || null,
        novaVenda.observacoes || null,
      ]
    );

    const vendaId = vendaResult.insertId;

    // Inserir itens da venda
    for (const item of novaVenda.itens) {
      await connection.execute(
        `INSERT INTO cant_vendas_itens (
          venda_id, produto_id, quantidade, preco_unitario, subtotal, pacote_aluno_id
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          vendaId,
          item.produtoId,
          item.quantidade,
          item.precoUnitario,
          item.subtotal,
          item.pacoteAlunoId || null,
        ]
      );
    }

    await connection.commit();
    return vendaId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function buscarVendas(
  dataInicio?: string,
  dataFim?: string,
  tipoCliente?: string,
  funcionarioCantina?: number,
  limite: number = 50,
  offset: number = 0
): Promise<Venda[]> {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT 
        v.id, v.numero_venda, v.tipo_cliente, v.ra_aluno, v.codigo_funcionario,
        v.funcionario_cantina_id as funcionarioCantina, v.valor_total, v.forma_pagamento,
        v.valor_recebido, v.valor_troco, v.observacoes, v.data_venda,
        CASE 
          WHEN v.tipo_cliente = 'aluno' THEN a.nome
          WHEN v.tipo_cliente = 'funcionario' THEN f.nome
          ELSE 'Cliente Avulso'
        END as nomeCliente
      FROM cant_vendas v
      LEFT JOIN cadastro_alunos a ON v.ra_aluno = a.ra
      LEFT JOIN funcionarios f ON v.codigo_funcionario = f.codigo
      WHERE 1=1
    `;

    const params: any[] = [];

    if (dataInicio) {
      query += ' AND DATE(v.data_venda) >= ?';
      params.push(dataInicio);
    }

    if (dataFim) {
      query += ' AND DATE(v.data_venda) <= ?';
      params.push(dataFim);
    }

    if (tipoCliente) {
      query += ' AND v.tipo_cliente = ?';
      params.push(tipoCliente);
    }

    if (funcionarioCantina) {
      query += ' AND v.funcionario_cantina_id = ?';
      params.push(funcionarioCantina);
    }

    query += ' ORDER BY v.data_venda DESC LIMIT ? OFFSET ?';
    params.push(limite, offset);

    const [rows] = await connection.execute<RowDataPacket[]>(query, params);

    const vendas = rows.map((row: any) => ({
      id: row.id,
      numeroVenda: row.numero_venda,
      tipoCliente: row.tipo_cliente,
      raAluno: row.ra_aluno,
      codigoFuncionario: row.codigo_funcionario,
      funcionarioCantina: row.funcionarioCantina,
      valorTotal: parseFloat(row.valor_total),
      formaPagamento: row.forma_pagamento,
      valorRecebido: row.valor_recebido ? parseFloat(row.valor_recebido) : undefined,
      valorTroco: row.valor_troco ? parseFloat(row.valor_troco) : undefined,
      observacoes: row.observacoes,
      dataVenda: new Date(row.data_venda),
      nomeCliente: row.nomeCliente,
    }));

    return vendas;
  } finally {
    connection.release();
  }
}

export async function buscarVendaPorId(id: number): Promise<Venda | null> {
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT 
        v.id, v.numero_venda, v.tipo_cliente, v.ra_aluno, v.codigo_funcionario,
        v.funcionario_cantina_id as funcionarioCantina, v.valor_total, v.forma_pagamento,
        v.valor_recebido, v.valor_troco, v.observacoes, v.data_venda,
        CASE 
          WHEN v.tipo_cliente = 'aluno' THEN a.nome
          WHEN v.tipo_cliente = 'funcionario' THEN f.nome
          ELSE 'Cliente Avulso'
        END as nomeCliente
      FROM cant_vendas v
      LEFT JOIN cadastro_alunos a ON v.ra_aluno = a.ra
      LEFT JOIN funcionarios f ON v.codigo_funcionario = f.codigo
      WHERE v.id = ?
    `;

    const [rows] = await connection.execute<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    // Buscar itens da venda
    const itens = await buscarItensVenda(id);

    const venda: Venda = {
      id: row.id,
      numeroVenda: row.numero_venda,
      tipoCliente: row.tipo_cliente,
      raAluno: row.ra_aluno,
      codigoFuncionario: row.codigo_funcionario,
      funcionarioCantina: row.funcionarioCantina,
      valorTotal: parseFloat(row.valor_total),
      formaPagamento: row.forma_pagamento,
      valorRecebido: row.valor_recebido ? parseFloat(row.valor_recebido) : undefined,
      valorTroco: row.valor_troco ? parseFloat(row.valor_troco) : undefined,
      observacoes: row.observacoes,
      dataVenda: new Date(row.data_venda),
      nomeCliente: row.nomeCliente,
      itens,
    };

    return venda;
  } finally {
    connection.release();
  }
}

export async function buscarItensVenda(vendaId: number): Promise<ItemVendaCompleto[]> {
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT 
        vi.id, vi.venda_id, vi.produto_id, vi.quantidade, 
        vi.preco_unitario, vi.subtotal, vi.pacote_aluno_id,
        p.nome as nomeProduto
      FROM cant_vendas_itens vi
      INNER JOIN cant_produtos p ON vi.produto_id = p.id
      WHERE vi.venda_id = ?
      ORDER BY vi.id
    `;

    const [rows] = await connection.execute<RowDataPacket[]>(query, [vendaId]);

    const itens = rows.map((row: any) => ({
      id: row.id,
      vendaId: row.venda_id,
      produtoId: row.produto_id,
      nomeProduto: row.nomeProduto,
      quantidade: row.quantidade,
      precoUnitario: parseFloat(row.preco_unitario),
      subtotal: parseFloat(row.subtotal),
      pacoteAlunoId: row.pacote_aluno_id,
    }));

    return itens;
  } finally {
    connection.release();
  }
}

export async function buscarEstatisticasVendas(
  dataInicio?: string,
  dataFim?: string
): Promise<any> {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT 
        COUNT(*) as totalVendas,
        SUM(valor_total) as faturamentoTotal,
        AVG(valor_total) as ticketMedio,
        COUNT(CASE WHEN tipo_cliente = 'aluno' THEN 1 END) as vendasAlunos,
        COUNT(CASE WHEN tipo_cliente = 'funcionario' THEN 1 END) as vendasFuncionarios,
        COUNT(CASE WHEN tipo_cliente = 'dinheiro' THEN 1 END) as vendasDinheiro,
        SUM(CASE WHEN tipo_cliente = 'aluno' THEN valor_total ELSE 0 END) as faturamentoAlunos,
        SUM(CASE WHEN tipo_cliente = 'funcionario' THEN valor_total ELSE 0 END) as faturamentoFuncionarios,
        SUM(CASE WHEN tipo_cliente = 'dinheiro' THEN valor_total ELSE 0 END) as faturamentoDinheiro
      FROM cant_vendas
      WHERE 1=1
    `;

    const params: any[] = [];

    if (dataInicio) {
      query += ' AND DATE(data_venda) >= ?';
      params.push(dataInicio);
    }

    if (dataFim) {
      query += ' AND DATE(data_venda) <= ?';
      params.push(dataFim);
    }

    const [rows] = await connection.execute<RowDataPacket[]>(query, params);
    const stats = rows[0] || {};

    return {
      totalVendas: stats.totalVendas || 0,
      faturamentoTotal: parseFloat(stats.faturamentoTotal || 0),
      ticketMedio: parseFloat(stats.ticketMedio || 0),
      vendasAlunos: stats.vendasAlunos || 0,
      vendasFuncionarios: stats.vendasFuncionarios || 0,
      vendasDinheiro: stats.vendasDinheiro || 0,
      faturamentoAlunos: parseFloat(stats.faturamentoAlunos || 0),
      faturamentoFuncionarios: parseFloat(stats.faturamentoFuncionarios || 0),
      faturamentoDinheiro: parseFloat(stats.faturamentoDinheiro || 0),
    };
  } finally {
    connection.release();
  }
}

// Função auxiliar para buscar funcionários da escola
export async function buscarFuncionariosEscola(nome?: string): Promise<any[]> {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT codigo, nome, cargo, departamento, inativo
      FROM funcionarios
      WHERE 1=1
    `;

    const params: any[] = [];

    if (nome) {
      query += ' AND nome LIKE ?';
      params.push(`%${nome}%`);
    }

    query += ' ORDER BY nome LIMIT 50';

    const [rows] = await connection.execute<RowDataPacket[]>(query, params);

    return rows.map((row: any) => ({
      codigo: row.codigo,
      nome: row.nome,
      cargo: row.cargo,
      departamento: row.departamento,
      ativo: !row.inativo,
    }));
  } finally {
    connection.release();
  }
}

// Função para buscar um funcionário específico por código
export async function buscarFuncionarioPorCodigo(codigo: number): Promise<any | null> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT codigo, nome, cargo, departamento, inativo FROM funcionarios WHERE codigo = ?',
      [codigo]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      codigo: row.codigo,
      nome: row.nome,
      cargo: row.cargo,
      departamento: row.departamento,
      ativo: !row.inativo,
    };
  } finally {
    connection.release();
  }
}
