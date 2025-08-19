import db from "./db";
import type {
  Caixa,
  AberturasCaixa,
  FechamentosCaixa,
  CaixaAberta,
  RelatorioCaixa,
  AbrirCaixaRequest,
  FecharCaixaRequest,
} from "../types/caixa";

export async function getCaixas(): Promise<Caixa[]> {
  const query = `
    SELECT 
      id,
      nome,
      descricao,
      ativo,
      data_criacao,
      data_atualizacao
    FROM cant_caixas 
    WHERE ativo = 1
    ORDER BY nome
  `;

  const [rows] = await db.query(query);
  return rows as Caixa[];
}

export async function getCaixasAbertas(): Promise<CaixaAberta[]> {
  const query = `
    SELECT 
      abertura_id,
      caixa_id,
      caixa_nome,
      funcionario_cantina_id,
      funcionario_nome,
      saldo_inicial,
      data_abertura
    FROM cant_view_caixas_abertas
    ORDER BY data_abertura DESC
  `;

  const [rows] = await db.query(query);
  return rows as CaixaAberta[];
}

export async function verificarCaixaAberta(
  caixaId: number
): Promise<CaixaAberta | null> {
  const query = `
    SELECT 
      abertura_id,
      caixa_id,
      caixa_nome,
      funcionario_cantina_id,
      funcionario_nome,
      saldo_inicial,
      data_abertura
    FROM cant_view_caixas_abertas
    WHERE caixa_id = ?
  `;

  const [rows] = await db.query(query, [caixaId]);
  const rs: any[] = rows as any[];
  return rs.length > 0 ? (rs[0] as CaixaAberta) : null;
}

export async function abrirCaixa(
  funcionario_cantina_id: number,
  dados: AbrirCaixaRequest
): Promise<number> {
  const { caixa_id, saldo_inicial, observacoes } = dados;

  // Verifica se o caixa já está aberto
  const caixaAberta = await verificarCaixaAberta(caixa_id);
  if (caixaAberta) {
    throw new Error("Este caixa já está aberto");
  }

  const query = `
    INSERT INTO cant_caixas_aberturas 
    (caixa_id, funcionario_cantina_id, saldo_inicial, observacoes)
    VALUES (?, ?, ?, ?)
  `;

  const [result]: any = await db.execute(query, [
    caixa_id,
    funcionario_cantina_id,
    saldo_inicial,
    observacoes || null,
  ]);

  return result.insertId;
}

export async function calcularTotaisCaixa(abertura_id: number): Promise<{
  total_vendas: number;
  total_dinheiro: number;
  total_cartao: number;
  total_pix: number;
  troco: number;
}> {
  const query = `
    SELECT 
      COALESCE(SUM(CASE WHEN forma_pagamento IN ('dinheiro', 'cartao', 'pix') THEN valor_total ELSE 0 END), 0) as total_vendas,
      COALESCE(SUM(CASE WHEN forma_pagamento = 'dinheiro' THEN valor_total ELSE 0 END), 0) as total_dinheiro,
      COALESCE(SUM(CASE WHEN forma_pagamento = 'cartao' THEN valor_total ELSE 0 END), 0) as total_cartao,
      COALESCE(SUM(CASE WHEN forma_pagamento = 'pix' THEN valor_total ELSE 0 END), 0) as total_pix,
      COALESCE(SUM(CASE WHEN forma_pagamento = 'dinheiro' THEN valor_troco ELSE 0 END), 0) as troco
    FROM cant_vendas v
    INNER JOIN cant_caixas_aberturas a ON v.data_venda >= a.data_abertura
    WHERE a.id = ? 
      AND v.funcionario_cantina_id = a.funcionario_cantina_id
      AND v.data_venda >= a.data_abertura
  `;

  const [rows] = await db.query(query, [abertura_id]);
  const rs: any[] = rows as any[];
  return (
    rs[0] || {
      total_vendas: 0,
      total_dinheiro: 0,
      total_cartao: 0,
      total_pix: 0,
      troco: 0,
    }
  );
}

export async function fecharCaixa(
  funcionario_cantina_id: number,
  dados: FecharCaixaRequest
): Promise<number> {
  const {
    abertura_id,
    saldo_final,
    total_dinheiro,
    total_cartao,
    total_pix,
    troco,
    observacoes,
  } = dados;

  // Verifica se a abertura existe e pertence ao funcionário
  const aberturaQuery = `
    SELECT id, saldo_inicial, funcionario_cantina_id 
    FROM cant_caixas_aberturas 
    WHERE id = ? AND aberto = 1
  `;

  const [aberturas] = await db.query(aberturaQuery, [abertura_id]);
  const rs: any[] = aberturas as any[];
  if (rs.length === 0) {
    throw new Error("Abertura de caixa não encontrada ou já fechada");
  }

  const abertura = rs[0];
  if (abertura.funcionario_cantina_id !== funcionario_cantina_id) {
    throw new Error("Você só pode fechar caixas que você mesmo abriu");
  }

  // Calcula totais automáticos
  const totais = await calcularTotaisCaixa(abertura_id);

  // Calcula diferença
  const saldoEsperado =
    abertura.saldo_inicial +
    (total_dinheiro || totais.total_dinheiro) -
    (troco || totais.troco);
  const diferenca = saldo_final - saldoEsperado;

  // Insere fechamento
  const fechamentoQuery = `
    INSERT INTO cant_caixas_fechamentos 
    (abertura_id, funcionario_cantina_id, saldo_final, total_vendas, total_movimentacoes, 
     total_dinheiro, total_cartao, total_pix, troco, diferenca, observacoes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const total_movimentacoes = totais.total_vendas;

  const [result]: any = await db.execute(fechamentoQuery, [
    abertura_id,
    funcionario_cantina_id,
    saldo_final,
    totais.total_vendas,
    total_movimentacoes,
    total_dinheiro || totais.total_dinheiro,
    total_cartao || totais.total_cartao,
    total_pix || totais.total_pix,
    troco || totais.troco,
    diferenca,
    observacoes || null,
  ]);

  // Marca abertura como fechada
  await db.execute("UPDATE cant_caixas_aberturas SET aberto = 0 WHERE id = ?", [
    abertura_id,
  ]);

  return result.insertId;
}

export async function getRelatoriosCaixa(
  dataInicio?: string,
  dataFim?: string,
  caixaId?: number
): Promise<RelatorioCaixa[]> {
  let whereClause = "1 = 1";
  const params: any[] = [];

  if (dataInicio) {
    whereClause += " AND DATE(a.data_abertura) >= ?";
    params.push(dataInicio);
  }

  if (dataFim) {
    whereClause += " AND DATE(a.data_abertura) <= ?";
    params.push(dataFim);
  }

  if (caixaId) {
    whereClause += " AND c.id = ?";
    params.push(caixaId);
  }

  const query = `
    SELECT 
      a.id as abertura_id,
      c.nome as caixa_nome,
      fc.nome as funcionario_nome,
      a.saldo_inicial,
      f.saldo_final,
      f.total_vendas,
      f.total_dinheiro,
      f.total_cartao,
      f.total_pix,
      f.troco,
      f.diferenca,
      a.data_abertura,
      f.data_fechamento,
      a.observacoes as observacoes_abertura,
      f.observacoes as observacoes_fechamento
    FROM cant_caixas_aberturas a
    INNER JOIN cant_caixas c ON a.caixa_id = c.id
    INNER JOIN cant_funcionarios fc ON a.funcionario_cantina_id = fc.id
    LEFT JOIN cant_caixas_fechamentos f ON a.id = f.abertura_id
    WHERE ${whereClause}
    ORDER BY a.data_abertura DESC
  `;

  const [rows] = await db.query(query, params);
  return rows as RelatorioCaixa[];
}

export async function criarCaixa(
  nome: string,
  descricao?: string
): Promise<number> {
  const query = `
    INSERT INTO cant_caixas (nome, descricao)
    VALUES (?, ?)
  `;

  const [result]: any = await db.execute(query, [nome, descricao || null]);
  return result.insertId;
}
