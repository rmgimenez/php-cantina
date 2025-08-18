const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sant31br',
  });
  const [rows] = await conn.execute(`
    SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'sant31br' AND TABLE_NAME = 'cant_funcionarios'
    ORDER BY ORDINAL_POSITION
  `);
  console.log('columns:', rows);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
