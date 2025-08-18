import db from './db';

export type TipoProduto = {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: number;
  dataCriacao: string;
};

export async function listarTiposProdutos({
  incluirInativos = false,
}: { incluirInativos?: boolean } = {}) {
  const sql = incluirInativos
    ? 'SELECT id, nome, descricao, ativo, data_criacao as dataCriacao FROM cant_tipos_produtos ORDER BY nome'
    : 'SELECT id, nome, descricao, ativo, data_criacao as dataCriacao FROM cant_tipos_produtos WHERE ativo = 1 ORDER BY nome';
  const [rows] = await db.query(sql);
  return rows as TipoProduto[];
}

export async function obterTipoProduto(id: number) {
  const [rows] = await db.query(
    'SELECT id, nome, descricao, ativo, data_criacao as dataCriacao FROM cant_tipos_produtos WHERE id = ? LIMIT 1',
    [id]
  );
  const rs: any = rows;
  return rs[0] || null;
}

export async function criarTipoProduto({ nome, descricao }: { nome: string; descricao?: string }) {
  const [result]: any = await db.execute(
    'INSERT INTO cant_tipos_produtos (nome, descricao, ativo) VALUES (?, ?, 1)',
    [nome, descricao || null]
  );
  return await obterTipoProduto(result.insertId);
}

export async function atualizarTipoProduto(
  id: number,
  { nome, descricao }: { nome?: string; descricao?: string }
) {
  const campos: string[] = [];
  const valores: any[] = [];
  if (nome !== undefined) {
    campos.push('nome = ?');
    valores.push(nome);
  }
  if (descricao !== undefined) {
    campos.push('descricao = ?');
    valores.push(descricao);
  }
  if (!campos.length) return await obterTipoProduto(id);
  valores.push(id);
  await db.execute(`UPDATE cant_tipos_produtos SET ${campos.join(', ')} WHERE id = ?`, valores);
  return await obterTipoProduto(id);
}

export async function inativarTipoProduto(id: number) {
  await db.execute('UPDATE cant_tipos_produtos SET ativo = 0 WHERE id = ?', [id]);
  return await obterTipoProduto(id);
}
