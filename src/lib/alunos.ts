import pool from "./db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Aluno {
  ra: number;
  nome: string;
  nome_social?: string;
  nasc?: Date;
  curso_nome?: string;
  serie?: number;
  turma?: string;
  periodo?: string;
  status?: string;
  nome_resp?: string;
  cpf_resp?: string;
  nasc_resp?: Date;
  tel_cel_resp?: string;
  email_resp?: string;
  nome_resp_fin?: string;
  cpf_resp_fin?: string;
  nasc_resp_fin?: Date;
}

export interface ContaAluno {
  id: number;
  ra_aluno: number;
  saldo: number;
  limite_diario?: number;
  ativo: boolean;
  data_criacao: Date;
  data_atualizacao: Date;
}

export interface AlunoCompleto extends Aluno {
  conta?: ContaAluno;
}

export interface MovimentacaoFinanceira {
  id: number;
  tipo_conta: "aluno" | "funcionario";
  ra_aluno?: number;
  codigo_funcionario?: number;
  tipo_movimentacao: "credito" | "debito";
  valor: number;
  descricao: string;
  venda_id?: number;
  funcionario_cantina_id?: number;
  data_movimentacao: Date;
}

/**
 * Buscar todos os alunos ativos
 */
export async function obterAlunosAtivos(): Promise<Aluno[]> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        ra, nome, nome_social, nasc, curso_nome, serie, turma, periodo, status,
        nome_resp, cpf_resp, nasc_resp, tel_cel_resp, email_resp,
        nome_resp_fin, cpf_resp_fin, nasc_resp_fin
      FROM alunos 
      WHERE status = 'MAT'
      ORDER BY nome`
    );
    return rows as Aluno[];
  } finally {
    connection.release();
  }
}

/**
 * Buscar aluno por RA
 */
export async function obterAlunoPorRA(ra: number): Promise<Aluno | null> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        ra, nome, nome_social, nasc, curso_nome, serie, turma, periodo, status,
        nome_resp, cpf_resp, nasc_resp, tel_cel_resp, email_resp,
        nome_resp_fin, cpf_resp_fin, nasc_resp_fin
      FROM alunos 
      WHERE ra = ? AND status = 'MAT'`,
      [ra]
    );
    return rows.length > 0 ? (rows[0] as Aluno) : null;
  } finally {
    connection.release();
  }
}

/**
 * Buscar alunos por nome (busca parcial)
 */
export async function buscarAlunosPorNome(nome: string): Promise<Aluno[]> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        ra, nome, nome_social, nasc, curso_nome, serie, turma, periodo, status,
        nome_resp, cpf_resp, nasc_resp, tel_cel_resp, email_resp,
        nome_resp_fin, cpf_resp_fin, nasc_resp_fin
      FROM alunos 
      WHERE (nome LIKE ? OR nome_social LIKE ?) AND status = 'MAT'
      ORDER BY nome
      LIMIT 50`,
      [`%${nome}%`, `%${nome}%`]
    );
    return rows as Aluno[];
  } finally {
    connection.release();
  }
}

/**
 * Obter conta do aluno
 */
export async function obterContaAluno(ra: number): Promise<ContaAluno | null> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM cant_contas_alunos WHERE ra_aluno = ?",
      [ra]
    );
    return rows.length > 0 ? (rows[0] as ContaAluno) : null;
  } finally {
    connection.release();
  }
}

/**
 * Criar conta para o aluno se não existir
 */
export async function criarContaAluno(
  ra: number,
  limite_diario?: number
): Promise<ContaAluno> {
  const connection = await pool.getConnection();
  try {
    // Verificar se já existe
    const contaExistente = await obterContaAluno(ra);
    if (contaExistente) {
      return contaExistente;
    }

    // Criar nova conta
    const [result] = await connection.execute<ResultSetHeader>(
      "INSERT INTO cant_contas_alunos (ra_aluno, saldo, limite_diario) VALUES (?, 0.00, ?)",
      [ra, limite_diario || null]
    );

    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM cant_contas_alunos WHERE id = ?",
      [result.insertId]
    );

    return rows[0] as ContaAluno;
  } finally {
    connection.release();
  }
}

/**
 * Adicionar crédito na conta do aluno usando stored procedure
 */
export async function adicionarCreditoAluno(
  ra: number,
  valor: number,
  funcionario_cantina_id: number | null,
  descricao: string = "Adição de crédito"
): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      "CALL sp_cant_adicionar_credito_aluno(?, ?, ?, ?)",
      [ra, valor, funcionario_cantina_id, descricao]
    );
    return true;
  } catch (error) {
    console.error("Erro ao adicionar crédito:", error);
    return false;
  } finally {
    connection.release();
  }
}

/**
 * Obter histórico de movimentações do aluno
 */
export async function obterMovimentacoesAluno(
  ra: number,
  limite: number = 50,
  offset: number = 0
): Promise<MovimentacaoFinanceira[]> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM cant_movimentacoes 
      WHERE tipo_conta = 'aluno' AND ra_aluno = ?
      ORDER BY data_movimentacao DESC
      LIMIT ? OFFSET ?`,
      [ra, limite, offset]
    );
    return rows as MovimentacaoFinanceira[];
  } finally {
    connection.release();
  }
}

/**
 * Obter saldo atual do aluno
 */
export async function obterSaldoAluno(ra: number): Promise<number> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT saldo FROM cant_contas_alunos WHERE ra_aluno = ?",
      [ra]
    );
    return rows.length > 0 ? rows[0].saldo : 0;
  } finally {
    connection.release();
  }
}

/**
 * Atualizar limite diário do aluno
 */
export async function atualizarLimiteDiario(
  ra: number,
  limite_diario?: number
): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute<ResultSetHeader>(
      "UPDATE cant_contas_alunos SET limite_diario = ? WHERE ra_aluno = ?",
      [limite_diario || null, ra]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Erro ao atualizar limite diário:", error);
    return false;
  } finally {
    connection.release();
  }
}

/**
 * Obter alunos com suas contas (view completa)
 */
export async function obterAlunosComContas(): Promise<AlunoCompleto[]> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        a.ra, a.nome, a.nome_social, a.nasc, a.curso_nome, a.serie, a.turma, a.periodo, a.status,
        a.nome_resp, a.cpf_resp, a.nasc_resp, a.tel_cel_resp, a.email_resp,
        a.nome_resp_fin, a.cpf_resp_fin, a.nasc_resp_fin,
        ca.id as conta_id, ca.saldo, ca.limite_diario, ca.ativo as conta_ativa,
        ca.data_criacao as conta_data_criacao, ca.data_atualizacao as conta_data_atualizacao
      FROM alunos a
      LEFT JOIN cant_contas_alunos ca ON a.ra = ca.ra_aluno
      WHERE a.status = 'MAT'
      ORDER BY a.nome`
    );

    return rows.map((row) => ({
      ra: row.ra,
      nome: row.nome,
      nome_social: row.nome_social,
      nasc: row.nasc,
      curso_nome: row.curso_nome,
      serie: row.serie,
      turma: row.turma,
      periodo: row.periodo,
      status: row.status,
      nome_resp: row.nome_resp,
      cpf_resp: row.cpf_resp,
      nasc_resp: row.nasc_resp,
      tel_cel_resp: row.tel_cel_resp,
      email_resp: row.email_resp,
      nome_resp_fin: row.nome_resp_fin,
      cpf_resp_fin: row.cpf_resp_fin,
      nasc_resp_fin: row.nasc_resp_fin,
      conta: row.conta_id
        ? {
            id: row.conta_id,
            ra_aluno: row.ra,
            saldo: row.saldo,
            limite_diario: row.limite_diario,
            ativo: row.conta_ativa,
            data_criacao: row.conta_data_criacao,
            data_atualizacao: row.conta_data_atualizacao,
          }
        : undefined,
    }));
  } finally {
    connection.release();
  }
}

/**
 * Verificar se aluno pode gastar determinado valor (considerando limite diário)
 */
export async function verificarLimiteGasto(
  ra: number,
  valor: number
): Promise<{ pode: boolean; motivo?: string }> {
  const connection = await pool.getConnection();
  try {
    const conta = await obterContaAluno(ra);
    if (!conta) {
      return { pode: false, motivo: "Conta não encontrada" };
    }

    // Verificar saldo
    if (conta.saldo < valor) {
      return { pode: false, motivo: "Saldo insuficiente" };
    }

    // Verificar limite diário se definido
    if (conta.limite_diario && conta.limite_diario > 0) {
      // Buscar gastos do dia atual
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT COALESCE(SUM(valor), 0) as gasto_hoje
        FROM cant_movimentacoes 
        WHERE tipo_conta = 'aluno' 
          AND ra_aluno = ? 
          AND tipo_movimentacao = 'debito'
          AND DATE(data_movimentacao) = CURDATE()`,
        [ra]
      );

      const gastoHoje = rows[0]?.gasto_hoje || 0;
      const gastoTotal = gastoHoje + valor;

      if (gastoTotal > conta.limite_diario) {
        return {
          pode: false,
          motivo: `Limite diário excedido. Gasto hoje: R$ ${gastoHoje.toFixed(
            2
          )}, Limite: R$ ${conta.limite_diario.toFixed(2)}`,
        };
      }
    }

    return { pode: true };
  } finally {
    connection.release();
  }
}
