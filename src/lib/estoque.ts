import db from './db';

export type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste';

export type EstoqueHistorico = {
  id: number;
  produtoId: number;
  tipoMovimentacao: TipoMovimentacao;
  quantidade: number;
  estoqueAnterior: number;
  estoqueAtual: number;
  motivo?: string | null;
  vendaId?: number | null;
  funcionarioCantinaId: number;
  dataMovimentacao: string;
};

async function withConnection<T>(fn: (conn: any) => Promise<T>) {
  const conn = await db.getConnection();
  try {
    return await fn(conn);
  } finally {
    try {
      conn.release();
    } catch {
      // ignore
    }
  }
}

export async function listarHistorico(produtoId?: number) {
  const sql = produtoId
    ? 'SELECT * FROM cant_estoque_historico WHERE produto_id = ? ORDER BY data_movimentacao DESC'
    : 'SELECT * FROM cant_estoque_historico ORDER BY data_movimentacao DESC';
  const [rows] = produtoId ? await db.query(sql, [produtoId]) : await db.query(sql);
  return rows as EstoqueHistorico[];
}

export async function registrarEntrada(
  produtoId: number,
  quantidade: number,
  funcionarioCantinaId: number,
  motivo?: string | null,
  vendaId?: number | null
) {
  if (quantidade <= 0) throw new Error('quantidade_invalid');
  return withConnection(async (conn) => {
    await conn.beginTransaction();
    try {
      const [rows]: any = await conn.query(
        'SELECT estoque_atual FROM cant_produtos WHERE id = ? FOR UPDATE',
        [produtoId]
      );
      if (!rows || rows.length === 0) throw new Error('produto_not_found');
      const estoqueAnterior = Number(rows[0].estoque_atual || 0);
      const estoqueAtual = estoqueAnterior + Number(quantidade);
      await conn.execute(
        'UPDATE cant_produtos SET estoque_atual = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
        [estoqueAtual, produtoId]
      );
      await conn.execute(
        `INSERT INTO cant_estoque_historico (produto_id, tipo_movimentacao, quantidade, estoque_anterior, estoque_atual, motivo, venda_id, funcionario_cantina_id, data_movimentacao)
         VALUES (?, 'entrada', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          produtoId,
          quantidade,
          estoqueAnterior,
          estoqueAtual,
          motivo || null,
          vendaId || null,
          funcionarioCantinaId,
        ]
      );
      await conn.commit();
      return { produtoId, estoqueAnterior, estoqueAtual };
    } catch (err) {
      await conn.rollback();
      throw err;
    }
  });
}

export async function registrarSaida(
  produtoId: number,
  quantidade: number,
  funcionarioCantinaId: number,
  motivo?: string | null,
  vendaId?: number | null
) {
  if (quantidade <= 0) throw new Error('quantidade_invalid');
  return withConnection(async (conn) => {
    await conn.beginTransaction();
    try {
      const [rows]: any = await conn.query(
        'SELECT estoque_atual FROM cant_produtos WHERE id = ? FOR UPDATE',
        [produtoId]
      );
      if (!rows || rows.length === 0) throw new Error('produto_not_found');
      const estoqueAnterior = Number(rows[0].estoque_atual || 0);
      const estoqueAtual = estoqueAnterior - Number(quantidade);
      if (estoqueAtual < 0) {
        throw new Error('insufficient_stock');
      }
      await conn.execute(
        'UPDATE cant_produtos SET estoque_atual = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
        [estoqueAtual, produtoId]
      );
      await conn.execute(
        `INSERT INTO cant_estoque_historico (produto_id, tipo_movimentacao, quantidade, estoque_anterior, estoque_atual, motivo, venda_id, funcionario_cantina_id, data_movimentacao)
         VALUES (?, 'saida', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          produtoId,
          quantidade,
          estoqueAnterior,
          estoqueAtual,
          motivo || null,
          vendaId || null,
          funcionarioCantinaId,
        ]
      );
      await conn.commit();
      return { produtoId, estoqueAnterior, estoqueAtual };
    } catch (err) {
      await conn.rollback();
      throw err;
    }
  });
}

export async function ajustarEstoque(
  produtoId: number,
  novoEstoque: number,
  funcionarioCantinaId: number,
  motivo?: string | null
) {
  if (novoEstoque < 0) throw new Error('estoque_negative');
  return withConnection(async (conn) => {
    await conn.beginTransaction();
    try {
      const [rows]: any = await conn.query(
        'SELECT estoque_atual FROM cant_produtos WHERE id = ? FOR UPDATE',
        [produtoId]
      );
      if (!rows || rows.length === 0) throw new Error('produto_not_found');
      const estoqueAnterior = Number(rows[0].estoque_atual || 0);
      const estoqueAtual = Number(novoEstoque);
      const quantidade = Math.abs(estoqueAtual - estoqueAnterior);
      await conn.execute(
        'UPDATE cant_produtos SET estoque_atual = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
        [estoqueAtual, produtoId]
      );
      await conn.execute(
        `INSERT INTO cant_estoque_historico (produto_id, tipo_movimentacao, quantidade, estoque_anterior, estoque_atual, motivo, venda_id, funcionario_cantina_id, data_movimentacao)
         VALUES (?, 'ajuste', ?, ?, ?, ?, NULL, ?, CURRENT_TIMESTAMP)`,
        [produtoId, quantidade, estoqueAnterior, estoqueAtual, motivo || null, funcionarioCantinaId]
      );
      await conn.commit();
      return { produtoId, estoqueAnterior, estoqueAtual };
    } catch (err) {
      await conn.rollback();
      throw err;
    }
  });
}

export default {
  listarHistorico,
  registrarEntrada,
  registrarSaida,
  ajustarEstoque,
};
