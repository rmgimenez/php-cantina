const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sant31br',
  });
  const [rows] = await conn.execute(
    'SELECT id, usuario, tipo, ativo, data_criacao FROM cant_funcionarios'
  );
  console.log(rows);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
