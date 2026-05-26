const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'library_management'
  };

  const email = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@library.com').toLowerCase();
  const newPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

  const conn = await mysql.createConnection(dbConfig);
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const [result] = await conn.query('UPDATE admins SET password_hash = ? WHERE email = ?', [hash, email]);
    if (result.affectedRows > 0) {
      console.log(`Password for ${email} reset successfully.`);
    } else {
      console.log(`No admin found with email ${email}.`);
    }
  } catch (err) {
    console.error('Failed to reset password:', err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main();
