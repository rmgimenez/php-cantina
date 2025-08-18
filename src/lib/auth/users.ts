import bcrypt from 'bcryptjs';
import db from '../db';

type User = {
  id?: number;
  username: string;
  passwordHash: string;
  role: 'administrador' | 'atendente' | 'estoquista';
};

export async function findUserByUsername(username: string) {
  const [rows] = await db.query(
    'SELECT id, usuario as username, senha as passwordHash, tipo as role FROM cant_funcionarios WHERE usuario = ? LIMIT 1',
    [username]
  );
  const rs: any = rows;
  if (!rs || rs.length === 0) return null;
  const row = rs[0];
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.passwordHash,
    role: row.role,
  } as User;
}

export async function createUser(username: string, plainPassword: string, role: User['role']) {
  const hash = await bcrypt.hash(plainPassword, 10);
  const [result] = await db.execute(
    'INSERT INTO cant_funcionarios (usuario, senha, tipo, ativo) VALUES (?, ?, ?, 1)',
    [username, hash, role]
  );
  return result;
}

export type { User };
