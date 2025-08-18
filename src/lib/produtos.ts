import db from "./db";

export type Produto = {
  id: number;
  codigoBarras: string | null;
  nome: string;
  descricao: string | null;
  tipoProdutoId: number;
  tipoProdutoNome?: string;
  preco: string; // decimal as string
  estoqueAtual: number;
  estoqueMinimo: number;
  isLowStock?: boolean;
  ativo: number;
  dataCriacao: string;
  dataAtualizacao: string;
};

export async function listarProdutos({
  incluirInativos = false,
  search,
  tipoProdutoId,
}: {
  incluirInativos?: boolean;
  search?: string | null;
  tipoProdutoId?: number | null;
} = {}) {
  const sqlBase = `SELECT p.id, p.codigo_barras as codigoBarras, p.nome, p.descricao, p.tipo_produto_id as tipoProdutoId, tp.nome as tipoProdutoNome, p.preco, p.estoque_atual as estoqueAtual, p.estoque_minimo as estoqueMinimo, p.ativo, p.data_criacao as dataCriacao, p.data_atualizacao as dataAtualizacao
    FROM cant_produtos p
    INNER JOIN cant_tipos_produtos tp ON tp.id = p.tipo_produto_id`;

  const whereClauses: string[] = [];
  const params: any[] = [];

  if (!incluirInativos) {
    whereClauses.push("p.ativo = 1");
  }

  if (search && String(search).trim()) {
    whereClauses.push("(p.nome LIKE ? OR p.codigo_barras LIKE ?)");
    const like = `%${String(search).trim()}%`;
    params.push(like, like);
  }

  if (tipoProdutoId !== undefined && tipoProdutoId !== null) {
    whereClauses.push("p.tipo_produto_id = ?");
    params.push(tipoProdutoId);
  }

  const where = whereClauses.length
    ? ` WHERE ${whereClauses.join(" AND ")}`
    : "";
  const sql = `${sqlBase}${where} ORDER BY p.nome`;
  const [rows] = await db.query(sql, params);
  const rs: any[] = rows as any[];
  return rs.map((r) => ({
    ...r,
    isLowStock: Number(r.estoqueAtual) <= Number(r.estoqueMinimo),
  })) as Produto[];
}

export async function obterProduto(id: number) {
  const [rows] = await db.query(
    `SELECT p.id, p.codigo_barras as codigoBarras, p.nome, p.descricao, p.tipo_produto_id as tipoProdutoId, tp.nome as tipoProdutoNome, p.preco, p.estoque_atual as estoqueAtual, p.estoque_minimo as estoqueMinimo, p.ativo, p.data_criacao as dataCriacao, p.data_atualizacao as dataAtualizacao
     FROM cant_produtos p INNER JOIN cant_tipos_produtos tp ON tp.id = p.tipo_produto_id WHERE p.id = ? LIMIT 1`,
    [id]
  );
  const rs: any = rows;
  if (!rs[0]) return null;
  const item = rs[0];
  return {
    ...item,
    isLowStock: Number(item.estoqueAtual) <= Number(item.estoqueMinimo),
  };
}

export type CriarProdutoInput = {
  codigoBarras?: string;
  nome: string;
  descricao?: string;
  tipoProdutoId: number;
  preco: number;
  estoqueAtual?: number;
  estoqueMinimo?: number;
};

export async function criarProduto(data: CriarProdutoInput) {
  const {
    codigoBarras = null,
    nome,
    descricao = null,
    tipoProdutoId,
    preco,
    estoqueAtual = 0,
    estoqueMinimo = 0,
  } = data;
  const [result]: any = await db.execute(
    `INSERT INTO cant_produtos (codigo_barras, nome, descricao, tipo_produto_id, preco, estoque_atual, estoque_minimo, ativo)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      codigoBarras,
      nome,
      descricao,
      tipoProdutoId,
      preco,
      estoqueAtual,
      estoqueMinimo,
    ]
  );
  return await obterProduto(result.insertId);
}

export type AtualizarProdutoInput = Partial<CriarProdutoInput>;

export async function atualizarProduto(
  id: number,
  data: AtualizarProdutoInput
) {
  const campos: string[] = [];
  const valores: any[] = [];
  if (data.codigoBarras !== undefined) {
    campos.push("codigo_barras = ?");
    valores.push(data.codigoBarras || null);
  }
  if (data.nome !== undefined) {
    campos.push("nome = ?");
    valores.push(data.nome);
  }
  if (data.descricao !== undefined) {
    campos.push("descricao = ?");
    valores.push(data.descricao || null);
  }
  if (data.tipoProdutoId !== undefined) {
    campos.push("tipo_produto_id = ?");
    valores.push(data.tipoProdutoId);
  }
  if (data.preco !== undefined) {
    campos.push("preco = ?");
    valores.push(data.preco);
  }
  if (data.estoqueAtual !== undefined) {
    campos.push("estoque_atual = ?");
    valores.push(data.estoqueAtual);
  }
  if (data.estoqueMinimo !== undefined) {
    campos.push("estoque_minimo = ?");
    valores.push(data.estoqueMinimo);
  }
  if (!campos.length) return await obterProduto(id);
  valores.push(id);
  await db.execute(
    `UPDATE cant_produtos SET ${campos.join(", ")} WHERE id = ?`,
    valores
  );
  return await obterProduto(id);
}

export async function inativarProduto(id: number) {
  await db.execute("UPDATE cant_produtos SET ativo = 0 WHERE id = ?", [id]);
  return await obterProduto(id);
}
