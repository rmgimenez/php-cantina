import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from './db';

export type TipoRestricao = 'produto' | 'tipo_produto';

/** Forma consumida pela UI/API */
export interface RestricaoView {
  id: number;
  raAluno: number;
  tipo: TipoRestricao;
  alvoId: number | null;
  descricao?: string | null;
  permitido: boolean;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

// Mantemos funções que falam com a tabela, mas retornamos um formato amigável à UI
export async function listarRestricoesPorAluno(ra: number): Promise<RestricaoView[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT * FROM cant_restricoes_alunos WHERE ra_aluno = ? ORDER BY data_criacao DESC',
      [ra]
    );

    return (rows as any[]).map((r) => ({
      id: r.id,
      raAluno: r.ra_aluno,
      tipo: r.tipo_restricao as TipoRestricao,
      alvoId: r.tipo_restricao === 'produto' ? r.produto_id ?? null : r.tipo_produto_id ?? null,
      descricao: r.descricao ?? null,
      permitido: r.permitido === 1 || r.permitido === true,
      ativo: r.ativo === 1 || r.ativo === true,
      dataCriacao: r.data_criacao,
      dataAtualizacao: r.data_atualizacao,
    }));
  } finally {
    conn.release();
  }
}

export async function criarRestricaoAluno(
  ra: number,
  tipo: TipoRestricao,
  produtoId?: number | null,
  tipoProdutoId?: number | null,
  permitido: boolean = false
): Promise<RestricaoView | null> {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO cant_restricoes_alunos (ra_aluno, tipo_restricao, produto_id, tipo_produto_id, permitido, ativo) VALUES (?, ?, ?, ?, ?, 1)`,
      [ra, tipo, produtoId || null, tipoProdutoId || null, permitido ? 1 : 0]
    );
    const insertId = (result as ResultSetHeader).insertId;
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT * FROM cant_restricoes_alunos WHERE id = ?',
      [insertId]
    );
    const r = (rows as any[])[0];
    if (!r) return null;
    return {
      id: r.id,
      raAluno: r.ra_aluno,
      tipo: r.tipo_restricao as TipoRestricao,
      alvoId: r.tipo_restricao === 'produto' ? r.produto_id ?? null : r.tipo_produto_id ?? null,
      descricao: r.descricao ?? null,
      permitido: r.permitido === 1 || r.permitido === true,
      ativo: r.ativo === 1 || r.ativo === true,
      dataCriacao: r.data_criacao,
      dataAtualizacao: r.data_atualizacao,
    };
  } finally {
    conn.release();
  }
}

export async function inativarRestricao(id: number): Promise<boolean> {
  const conn = await pool.getConnection();
  try {
    const [res] = await conn.execute<ResultSetHeader>(
      'UPDATE cant_restricoes_alunos SET ativo = 0, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return (res as ResultSetHeader).affectedRows > 0;
  } finally {
    conn.release();
  }
}
