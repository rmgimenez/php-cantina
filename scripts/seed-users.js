const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sant31br',
  });
  // create table if not exists
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS cant_funcionarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('administrador','atendente','estoquista') NOT NULL,
      ativo TINYINT DEFAULT 1,
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  async function seedUser(username, pass, role) {
    const [rows] = await conn.execute(
      'SELECT id FROM cant_funcionarios WHERE usuario = ? LIMIT 1',
      [username]
    );
    if (rows.length) return;
    const hash = await bcrypt.hash(pass, 10);
    await conn.execute(
      'INSERT INTO cant_funcionarios (usuario, senha, tipo, ativo) VALUES (?, ?, ?, 1)',
      [username, hash, role]
    );
    console.log('seeded', username);
  }

  await seedUser('admin', 'admin123', 'administrador');
  await seedUser('atendente', 'atende123', 'atendente');
  await seedUser('estoquista', 'estoq123', 'estoquista');

  await conn.end();
  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
