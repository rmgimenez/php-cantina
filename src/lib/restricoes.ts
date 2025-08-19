import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from './db';

export type TipoRestricao = 'produto' | 'tipo_produto';

export interface RestricaoAluno {
  id: number;
  ra_aluno: number;
  tipo_restricao: TipoRestricao;
  produto_id?: number | null;
  tipo_produto_id?: number | null;
  permitido: number | boolean;
  data_criacao: Date;
  data_atualizacao: Date;
}

export async function listarRestricoesPorAluno(ra: number): Promise<RestricaoAluno[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT * FROM cant_restricoes_alunos WHERE ra_aluno = ? ORDER BY data_criacao DESC',
      [ra]
    );
    return rows as RestricaoAluno[];
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
): Promise<RestricaoAluno | null> {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO cant_restricoes_alunos (ra_aluno, tipo_restricao, produto_id, tipo_produto_id, permitido) VALUES (?, ?, ?, ?, ?)`,
      [ra, tipo, produtoId || null, tipoProdutoId || null, permitido ? 1 : 0]
    );
    const insertId = (result as ResultSetHeader).insertId;
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT * FROM cant_restricoes_alunos WHERE id = ?',
      [insertId]
    );
    return rows[0] as RestricaoAluno;
  } finally {
    conn.release();
  }
}

export async function inativarRestricao(id: number): Promise<boolean> {
  const conn = await pool.getConnection();
  try {
    const [res] = await conn.execute<ResultSetHeader>(
      'DELETE FROM cant_restricoes_alunos WHERE id = ?',
      [id]
    );
    return (res as ResultSetHeader).affectedRows > 0;
  } finally {
    conn.release();
  }
}
