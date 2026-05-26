const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function main() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'library_management'
  };

  const conn = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await conn.query('SELECT id, name, email, password_hash, phone FROM admins');
    console.log(JSON.stringify(rows, null, 2));

    const bcrypt = require('bcryptjs');
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || '';
    if (rows.length > 0 && defaultPassword) {
      const ok = await bcrypt.compare(defaultPassword, rows[0].password_hash);
      console.log('\nDEFAULT_ADMIN_PASSWORD matches stored hash:', ok);
    }
  } catch (err) {
    console.error('Query failed:', err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main();
