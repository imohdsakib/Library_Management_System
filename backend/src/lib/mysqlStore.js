const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const FINE_PER_DAY = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// timezone for date-only handling
const ZONE = process.env.APP_TIMEZONE || 'Asia/Kolkata';

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "library_management",
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: false
};

let pool = null;
let initializationPromise = null;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(value) {
  if (!value) return null;

  // If DB returned a plain YYYY-MM-DD string, return as-is
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  // Use Intl.DateTimeFormat for the configured timezone to get Y/M/D
  try {
    const dtf = new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = dtf.formatToParts(date);
    const year = parts.find((p) => p.type === 'year').value;
    const month = parts.find((p) => p.type === 'month').value;
    const day = parts.find((p) => p.type === 'day').value;
    return `${year}-${month}-${day}`;
  } catch (err) {
    // fallback to local getters
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

function toUtcDateOnly(value) {
  if (!value) return null;

  // get the YYYY-MM-DD as per configured timezone
  const dateString = formatDate(value);
  if (!dateString) return null;

  const [year, month, day] = dateString.split('-').map(Number);
  // Create a Date at UTC midnight for that zoned date (so comparisons are consistent)
  return new Date(Date.UTC(year, month - 1, day));
}

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: false
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  await connection.end();
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(30) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      student_id VARCHAR(60) NOT NULL UNIQUE,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NULL,
      phone VARCHAR(30) NULL,
      course VARCHAR(120) NULL,
      created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
      blocked TINYINT(1) NOT NULL DEFAULT 0,
      deleted_at DATE NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const studentAdminColumn = await query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'admin_id' LIMIT 1",
    [dbConfig.database]
  );
  if (studentAdminColumn.length === 0) {
    await pool.query("ALTER TABLE students ADD COLUMN admin_id INT NULL AFTER created_at");
  }

  // Backward-compatible migration for existing databases (works on older MySQL too)
  const blockedColumn = await query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'blocked' LIMIT 1",
    [dbConfig.database]
  );
  if (blockedColumn.length === 0) {
    await pool.query("ALTER TABLE students ADD COLUMN blocked TINYINT(1) NOT NULL DEFAULT 0");
  }

  const deletedAtColumn = await query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'deleted_at' LIMIT 1",
    [dbConfig.database]
  );
  if (deletedAtColumn.length === 0) {
    await pool.query("ALTER TABLE students ADD COLUMN deleted_at DATE NULL");
  }

  const passwordHashColumn = await query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'password_hash' LIMIT 1",
    [dbConfig.database]
  );
  if (passwordHashColumn.length === 0) {
    await pool.query("ALTER TABLE students ADD COLUMN password_hash VARCHAR(255) NULL AFTER email");
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      author VARCHAR(200) NOT NULL,
      isbn VARCHAR(80) NULL,
      category VARCHAR(120) NOT NULL,
      total_copies INT NOT NULL DEFAULT 0,
      available_copies INT NOT NULL DEFAULT 0,
      published_year INT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const bookAdminColumn = await query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'books' AND COLUMN_NAME = 'admin_id' LIMIT 1",
    [dbConfig.database]
  );
  if (bookAdminColumn.length === 0) {
    await pool.query("ALTER TABLE books ADD COLUMN admin_id INT NULL AFTER isbn");
  }

  // Migration: if the books table already exists with NOT NULL isbn, alter it to NULL and drop UNIQUE constraint
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM books WHERE Field = 'isbn'");
    if (columns && columns.length > 0) {
      const isbnCol = columns[0];
      // If it's NOT NULL, make it NULL
      if (isbnCol.Null === 'NO') {
        await pool.query("ALTER TABLE books MODIFY COLUMN isbn VARCHAR(80) NULL");
      }
    }
    // Drop UNIQUE index if it exists
    const [indexes] = await pool.query("SHOW INDEX FROM books WHERE Column_name = 'isbn' AND Key_name != 'PRIMARY'");
    if (indexes && indexes.length > 0) {
      const indexName = indexes[0].Key_name;
      await pool.query(`ALTER TABLE books DROP INDEX \`${indexName}\``);
    }
  } catch (e) {
    console.warn("[STORE] Warning during books table migration:", e.message);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS issues (
      id INT AUTO_INCREMENT PRIMARY KEY,
      book_id INT NOT NULL,
      student_id INT NOT NULL,
      issue_date DATE NOT NULL,
      due_date DATE NOT NULL,
      return_date DATE NULL,
      status ENUM('issued', 'returned') NOT NULL DEFAULT 'issued',
      fine INT NOT NULL DEFAULT 0,
      collected_upto DATE NULL,
      CONSTRAINT fk_issues_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_issues_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const issueAdminColumn = await query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'issues' AND COLUMN_NAME = 'admin_id' LIMIT 1",
    [dbConfig.database]
  );
  if (issueAdminColumn.length === 0) {
    await pool.query("ALTER TABLE issues ADD COLUMN admin_id INT NULL AFTER id");
  }

  const collectedUptoColumn = await query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'issues' AND COLUMN_NAME = 'collected_upto' LIMIT 1",
    [dbConfig.database]
  );
  if (collectedUptoColumn.length === 0) {
    await pool.query("ALTER TABLE issues ADD COLUMN collected_upto DATE NULL");
  }
}

async function ensureDefaultAdmin() {
  const defaultEmail = (process.env.DEFAULT_ADMIN_EMAIL || "admin@library.com").toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || "admin123", 10);
  const adminName = process.env.DEFAULT_ADMIN_NAME || "Library Admin";
  const adminPhone = process.env.DEFAULT_ADMIN_PHONE || "9999999999";
  const [rows] = await pool.query("SELECT id FROM admins WHERE email = ? LIMIT 1", [defaultEmail]);

  if (rows.length > 0) {
    return;
  }

  await pool.query(
    "INSERT INTO admins (name, email, password_hash, phone) VALUES (?, ?, ?, ?)",
    [adminName, defaultEmail, passwordHash, adminPhone]
  );
}

async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const maxAttempts = 6;
      let attempt = 0;
      let lastErr = null;

      while (attempt < maxAttempts) {
        attempt += 1;
        try {
          console.log(`[STORE] DB init attempt ${attempt}/${maxAttempts} to ${dbConfig.host}:${dbConfig.port} (db=${dbConfig.database})`);
          await ensureDatabaseExists();
          pool = mysql.createPool(dbConfig);
          // ensure pool connections use the desired DB time zone offset (default IST)
          const TZ_OFFSET = process.env.DB_TIMEZONE_OFFSET || '+05:30';
          try {
            pool.on && pool.on('connection', (conn) => {
              try { conn.query(`SET time_zone = '${TZ_OFFSET}'`); } catch (e) { /* ignore */ }
            });
            // set for at least one connection immediately
            await pool.query(`SET time_zone = '${TZ_OFFSET}'`);
          } catch (e) {
            // ignore if driver doesn't support events or query fails
          }
          await ensureSchema();
          await ensureDefaultAdmin();

          // After default admin exists, migrate existing rows to be owned by default admin
          try {
            const defaultEmail = (process.env.DEFAULT_ADMIN_EMAIL || "admin@library.com").toLowerCase();
            const [[adminRow]] = await pool.query("SELECT id FROM admins WHERE email = ? LIMIT 1", [defaultEmail]);
            const defaultAdminId = adminRow && adminRow.id ? adminRow.id : null;

            if (defaultAdminId) {
              // Ensure students, books, issues have admin_id column filled for existing rows
              // students
              try {
                await pool.query("ALTER TABLE students MODIFY COLUMN admin_id INT NULL");
                await pool.query("UPDATE students SET admin_id = ? WHERE admin_id IS NULL", [defaultAdminId]);
                await pool.query("ALTER TABLE students MODIFY COLUMN admin_id INT NOT NULL");
              } catch (e) {
                // ignore individual table migration errors
              }

              // books
              try {
                await pool.query("ALTER TABLE books MODIFY COLUMN admin_id INT NULL");
                await pool.query("UPDATE books SET admin_id = ? WHERE admin_id IS NULL", [defaultAdminId]);
                await pool.query("ALTER TABLE books MODIFY COLUMN admin_id INT NOT NULL");
              } catch (e) {
                // ignore
              }

              // issues
              try {
                await pool.query("ALTER TABLE issues MODIFY COLUMN admin_id INT NULL");
                await pool.query("UPDATE issues SET admin_id = ? WHERE admin_id IS NULL", [defaultAdminId]);
                await pool.query("ALTER TABLE issues MODIFY COLUMN admin_id INT NOT NULL");
              } catch (e) {
                // ignore
              }
            }
          } catch (e) {
            // ignore migration errors here
          }
          console.log(`[STORE] Database initialized (attempt ${attempt})`);
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
          console.error(`[STORE] Database init attempt ${attempt} failed: ${err && err.message}`);
          // on final attempt, rethrow
          if (attempt >= maxAttempts) break;
          // backoff before retrying
          const waitMs = Math.min(1000 * Math.pow(2, attempt), 15000);
          console.log(`[STORE] Retrying in ${waitMs}ms...`);
          await sleep(waitMs);
        }
      }

      if (lastErr) {
        throw lastErr;
      }
    })();
  }

  return initializationPromise;
}

async function query(sql, params = []) {
  if (!pool) {
    await initializeDatabase();
  }

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getAdmin(email) {
  const rows = await query("SELECT * FROM admins WHERE email = ? LIMIT 1", [email.toLowerCase()]);
  return rows[0] || null;
}

async function adminEmailExists(email, excludeId = null) {
  const params = [email.toLowerCase()];
  let sql = "SELECT id FROM admins WHERE email = ?";
  if (excludeId !== null && excludeId !== undefined) {
    sql += " AND id <> ?";
    params.push(Number(excludeId));
  }

  const rows = await query(sql, params);
  return rows.length > 0;
}

async function updateAdmin(id, name, email, phone, passwordHash) {
  const params = [];
  const sets = [];

  if (name !== undefined) {
    sets.push("name = ?");
    params.push(name);
  }
  if (email !== undefined) {
    sets.push("email = ?");
    params.push(email.toLowerCase());
  }
  if (phone !== undefined) {
    sets.push("phone = ?");
    params.push(phone || null);
  }
  if (passwordHash !== undefined) {
    sets.push("password_hash = ?");
    params.push(passwordHash);
  }

  if (sets.length === 0) {
    return getAdminById(id);
  }

  params.push(Number(id));
  const sql = `UPDATE admins SET ${sets.join(", ")} WHERE id = ?`;
  const result = await query(sql, params);
  if (result.affectedRows === 0) return null;
  return getAdminById(id);
}

async function getAdminById(id) {
  const rows = await query("SELECT * FROM admins WHERE id = ? LIMIT 1", [Number(id)]);
  return rows[0] || null;
}

async function createAdmin(name, email, passwordHash, phone) {
  const result = await query(
    "INSERT INTO admins (name, email, password_hash, phone) VALUES (?, ?, ?, ?)",
    [name, email.toLowerCase(), passwordHash, phone || null]
  );

  return {
    id: result.insertId,
    name,
    email: email.toLowerCase(),
    password_hash: passwordHash,
    phone: phone || null
  };
}

async function getAllStudents(adminId = null) {
  let sql = "SELECT id, name, student_id AS studentId, email, phone, course, created_at AS createdAt, blocked, deleted_at AS deletedAt FROM students WHERE deleted_at IS NULL";
  const params = [];
  if (adminId !== null && adminId !== undefined) {
    sql += " AND admin_id = ?";
    params.push(Number(adminId));
  }
  sql += " ORDER BY id DESC";

  const rows = await query(sql, params);

  return rows.map((row) => ({
    ...row,
    createdAt: formatDate(row.createdAt)
  }));
}

async function getStudent(id) {
  const rows = await query("SELECT * FROM students WHERE id = ? LIMIT 1", [Number(id)]);
  return rows[0] || null;
}

async function getStudentByStudentId(studentId) {
  const rows = await query("SELECT * FROM students WHERE student_id = ? LIMIT 1", [studentId]);
  return rows[0] || null;
}

async function deleteStudent(id, adminId = null) {
  // soft delete: set deleted_at to today
  let sql = "UPDATE students SET deleted_at = CURDATE() WHERE id = ? AND deleted_at IS NULL";
  const params = [Number(id)];
  if (adminId !== null && adminId !== undefined) {
    sql += " AND admin_id = ?";
    params.push(Number(adminId));
  }
  const result = await query(sql, params);
  return result.affectedRows > 0;
}

async function undeleteStudent(id, adminId = null) {
  // restore: clear deleted_at
  let sql = "UPDATE students SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL";
  const params = [Number(id)];
  if (adminId !== null && adminId !== undefined) {
    sql += " AND admin_id = ?";
    params.push(Number(adminId));
  }
  const result = await query(sql, params);
  return result.affectedRows > 0;
}

async function blockStudent(id, adminId = null) {
  let sql = "UPDATE students SET blocked = 1 WHERE id = ?";
  const params = [Number(id)];
  if (adminId !== null && adminId !== undefined) {
    sql += " AND admin_id = ?";
    params.push(Number(adminId));
  }
  const result = await query(sql, params);
  return result.affectedRows > 0;
}

async function unblockStudent(id, adminId = null) {
  let sql = "UPDATE students SET blocked = 0 WHERE id = ?";
  const params = [Number(id)];
  if (adminId !== null && adminId !== undefined) {
    sql += " AND admin_id = ?";
    params.push(Number(adminId));
  }
  const result = await query(sql, params);
  return result.affectedRows > 0;
}

async function studentExists(studentId, email, excludeId = null, adminId = null) {
  const params = [studentId, email.toLowerCase()];
  let sql = "SELECT id FROM students WHERE (student_id = ? OR email = ?)";

  if (excludeId !== null && excludeId !== undefined) {
    sql += " AND id <> ?";
    params.push(Number(excludeId));
  }

  if (adminId !== null && adminId !== undefined) {
    sql += " AND admin_id = ?";
    params.push(Number(adminId));
  }

  const rows = await query(sql, params);
  return rows.length > 0;
}

async function createStudent(name, studentId, email, phone, course, passwordHash = null, adminId = null) {
  const cols = ["name", "student_id", "email", "password_hash", "phone", "course", "created_at"];
  const placeholders = ["?", "?", "?", "?", "?", "?", "CURDATE()"];
  const params = [name, studentId, email.toLowerCase(), passwordHash, phone || null, course || null];

  if (adminId !== null && adminId !== undefined) {
    cols.splice(6, 0, "admin_id");
    placeholders.splice(6, 0, "?");
    params.splice(6, 0, Number(adminId));
  }

  const sql = `INSERT INTO students (${cols.join(", ")}) VALUES (${placeholders.join(", ")})`;
  const result = await query(sql, params);

  return {
    id: result.insertId,
    name,
    student_id: studentId,
    email: email.toLowerCase(),
    phone: phone || null,
    course: course || null
  };
}

async function updateStudent(id, name, studentId, email, phone, course, passwordHash, adminId = null) {
  const sets = ["name = ?", "student_id = ?", "email = ?", "phone = ?", "course = ?"];
  const params = [name, studentId, email.toLowerCase(), phone || null, course || null];

  if (passwordHash !== undefined) {
    sets.push("password_hash = ?");
    params.push(passwordHash);
  }

  let sql = `UPDATE students SET ${sets.join(", ")} WHERE id = ?`;
  if (adminId !== null && adminId !== undefined) {
    sql += " AND admin_id = ?";
  }

  const finalParams = [...params, Number(id)];
  if (adminId !== null && adminId !== undefined) finalParams.push(Number(adminId));

  const result = await query(sql, finalParams);

  if (result.affectedRows === 0) {
    return null;
  }

  return getStudent(id);
}

async function getAllBooks(adminId = null) {
  let sql = "SELECT id, title, author, isbn, category, total_copies AS totalCopies, available_copies AS availableCopies, published_year AS publishedYear FROM books";
  const params = [];
  if (adminId !== null && adminId !== undefined) {
    sql += " WHERE admin_id = ?";
    params.push(Number(adminId));
  }
  sql += " ORDER BY id DESC";

  const rows = await query(sql, params);

  return rows.map((row) => ({
    ...row,
    totalCopies: Number(row.totalCopies),
    availableCopies: Number(row.availableCopies)
  }));
}

async function getBook(id, adminId = null) {
  let sql = "SELECT * FROM books WHERE id = ? LIMIT 1";
  const params = [Number(id)];
  if (adminId !== null && adminId !== undefined) {
    sql = "SELECT * FROM books WHERE id = ? AND admin_id = ? LIMIT 1";
    params.push(Number(adminId));
  }
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function bookIsbnExists(isbn, excludeId = null, adminId = null) {
  if (!isbn) return false;
  const params = [isbn];
  let sql = "SELECT id FROM books WHERE isbn = ?";

  if (excludeId !== null && excludeId !== undefined) {
    sql += " AND id <> ?";
    params.push(Number(excludeId));
  }

  if (adminId !== null && adminId !== undefined) {
    sql += " AND admin_id = ?";
    params.push(Number(adminId));
  }

  const rows = await query(sql, params);
  return rows.length > 0;
}

async function createBook(title, author, isbn, category, totalCopies, publishedYear, adminId = null) {
  const cols = ["title", "author", "isbn", "category", "total_copies", "available_copies", "published_year"];
  const placeholders = ["?", "?", "?", "?", "?", "?", "?"];
  const params = [title, author, isbn || null, category, Number(totalCopies), Number(totalCopies), publishedYear || null];

  if (adminId !== null && adminId !== undefined) {
    cols.push("admin_id");
    placeholders.push("?");
    params.push(Number(adminId));
  }

  const sql = `INSERT INTO books (${cols.join(", ")}) VALUES (${placeholders.join(", ")})`;
  const result = await query(sql, params);

  return {
    id: result.insertId,
    title,
    author,
    isbn,
    category,
    total_copies: Number(totalCopies),
    available_copies: Number(totalCopies),
    published_year: publishedYear || null
  };
}

async function updateBook(id, title, author, isbn, category, totalCopies, publishedYear, adminId = null) {
  const book = await getBook(id, adminId);
  if (!book) {
    return null;
  }

  const issuedCount = Number(book.total_copies) - Number(book.available_copies);
  const nextAvailable = Math.max(Number(totalCopies) - issuedCount, 0);

  let sql = "UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, total_copies = ?, available_copies = ?, published_year = ? WHERE id = ?";
  const params = [title, author, isbn || null, category, Number(totalCopies), nextAvailable, publishedYear || null, Number(id)];
  if (adminId !== null && adminId !== undefined) {
    sql += " AND admin_id = ?";
    params.push(Number(adminId));
  }

  const result = await query(sql, params);

  if (result.affectedRows === 0) {
    return null;
  }

  return getBook(id);
}

async function deleteBook(id, adminId = null) {
  const activeRows = await query("SELECT id FROM issues WHERE book_id = ? AND status = 'issued' LIMIT 1", [Number(id)]);
  if (activeRows.length > 0) {
    return false;
  }

  let sql = "DELETE FROM books WHERE id = ?";
  const params = [Number(id)];
  if (adminId !== null && adminId !== undefined) {
    sql += " AND admin_id = ?";
    params.push(Number(adminId));
  }
  const result = await query(sql, params);
  return result.affectedRows > 0;
}

async function getAllIssues(adminId = null) {
  let sql = `SELECT
      i.id,
      i.book_id AS bookId,
      i.student_id AS studentId,
      i.issue_date AS issueDate,
      i.due_date AS dueDate,
      i.return_date AS returnDate,
      i.collected_upto AS collectedUpto,
      i.status,
      i.fine,
      b.title AS bookTitle,
      s.name AS studentName,
      s.student_id AS studentCode
    FROM issues i
    INNER JOIN books b ON b.id = i.book_id
    INNER JOIN students s ON s.id = i.student_id`;

  const params = [];
  if (adminId !== null && adminId !== undefined) {
    sql += " WHERE i.admin_id = ?";
    params.push(Number(adminId));
  }
  sql += " ORDER BY i.id DESC";

  const rows = await query(sql, params);

  return rows.map((row) => ({
    ...row,
    issueDate: formatDate(row.issueDate),
    dueDate: formatDate(row.dueDate),
    returnDate: formatDate(row.returnDate),
    collectedUpto: formatDate(row.collectedUpto),
    fine: Number(row.fine || 0)
  }));
}

async function getIssue(id, adminId = null) {
  let sql = "SELECT * FROM issues WHERE id = ? LIMIT 1";
  const params = [Number(id)];
  if (adminId !== null && adminId !== undefined) {
    sql = "SELECT * FROM issues WHERE id = ? AND admin_id = ? LIMIT 1";
    params.push(Number(adminId));
  }
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function createIssue(bookId, studentId, dueDate, adminId = null) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const bookQuery = adminId !== null && adminId !== undefined ? "SELECT * FROM books WHERE id = ? AND admin_id = ? FOR UPDATE" : "SELECT * FROM books WHERE id = ? FOR UPDATE";
    const bookQueryParams = adminId !== null && adminId !== undefined ? [Number(bookId), Number(adminId)] : [Number(bookId)];
    const [bookRows] = await connection.query(bookQuery, bookQueryParams);
    const book = bookRows[0];
    if (!book || Number(book.available_copies) < 1) {
      await connection.rollback();
      return null;
    }

    const studentQuery = adminId !== null && adminId !== undefined ? "SELECT id FROM students WHERE id = ? AND admin_id = ? LIMIT 1" : "SELECT id FROM students WHERE id = ? LIMIT 1";
    const studentQueryParams = adminId !== null && adminId !== undefined ? [Number(studentId), Number(adminId)] : [Number(studentId)];
    const [studentRows] = await connection.query(studentQuery, studentQueryParams);
    if (studentRows.length === 0) {
      await connection.rollback();
      return null;
    }
    // ensure student not blocked
    const [blockedRows] = await connection.query("SELECT blocked FROM students WHERE id = ? LIMIT 1", [Number(studentId)]);
    if (blockedRows.length > 0 && blockedRows[0].blocked) {
      await connection.rollback();
      return null;
    }

    // insert with admin_id when available
    if (adminId !== null && adminId !== undefined) {
      const [result] = await connection.query(
        "INSERT INTO issues (admin_id, book_id, student_id, issue_date, due_date, return_date, status, fine) VALUES (?, ?, ?, CURDATE(), ?, NULL, 'issued', 0)",
        [Number(adminId), Number(bookId), Number(studentId), dueDate]
      );

      await connection.query(
        "UPDATE books SET available_copies = available_copies - 1 WHERE id = ?",
        [Number(bookId)]
      );

      await connection.commit();

      return {
        id: result.insertId,
        book_id: Number(bookId),
        student_id: Number(studentId),
        due_date: dueDate,
        status: "issued"
      };
    }

    const [result] = await connection.query(
      "INSERT INTO issues (book_id, student_id, issue_date, due_date, return_date, status, fine) VALUES (?, ?, CURDATE(), ?, NULL, 'issued', 0)",
      [Number(bookId), Number(studentId), dueDate]
    );

    await connection.query(
      "UPDATE books SET available_copies = available_copies - 1 WHERE id = ?",
      [Number(bookId)]
    );

    await connection.commit();

    return {
      id: result.insertId,
      book_id: Number(bookId),
      student_id: Number(studentId),
      due_date: dueDate,
      status: "issued"
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function returnIssue(id) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [issueRows] = await connection.query("SELECT * FROM issues WHERE id = ? FOR UPDATE", [Number(id)]);
    const issue = issueRows[0];
    if (!issue || issue.status === "returned") {
      await connection.rollback();
      return null;
    }

    const returnDate = formatDate(new Date());
  const due = toUtcDateOnly(issue.due_date);
  const returned = toUtcDateOnly(returnDate);
  const overdueDays = due && returned ? Math.max(0, Math.ceil((returned.getTime() - due.getTime()) / MS_PER_DAY)) : 0;
  const fine = overdueDays * FINE_PER_DAY;

    await connection.query(
      "UPDATE issues SET status = 'returned', return_date = ?, fine = ? WHERE id = ?",
      [returnDate, fine, Number(id)]
    );

    await connection.query(
      "UPDATE books SET available_copies = available_copies + 1 WHERE id = ?",
      [Number(issue.book_id)]
    );

    await connection.commit();

    return {
      ...issue,
      return_date: returnDate,
      status: "returned",
      fine
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function collectFine(id) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [issueRows] = await connection.query("SELECT * FROM issues WHERE id = ? FOR UPDATE", [Number(id)]);
    const issue = issueRows[0];
    if (!issue) {
      await connection.rollback();
      return null;
    }
    console.log(`[STORE] collectFine starting for issue ${id}:`, issue);

    // determine current outstanding fine
    let outstanding = 0;

    const todayDate = formatDate(new Date());
    const due = toUtcDateOnly(issue.due_date);

    if (issue.status === 'returned') {
      outstanding = Number(issue.fine || 0);
      // mark collected up to return_date
      await connection.query("UPDATE issues SET fine = 0, collected_upto = ? WHERE id = ?", [formatDate(issue.return_date || todayDate), Number(id)]);
      console.log(`[STORE] collectFine updated returned issue ${id}, set collected_upto=${formatDate(issue.return_date || todayDate)}`);
    } else {
      // issue still active: compute overdue days up to today minus previously collected days
      const returned = toUtcDateOnly(todayDate);
      const totalOverdueDays = due && returned ? Math.max(0, Math.ceil((returned.getTime() - due.getTime()) / MS_PER_DAY)) : 0;
      let alreadyCollectedDays = 0;
      if (issue.collected_upto) {
        const collectedDt = toUtcDateOnly(issue.collected_upto);
        alreadyCollectedDays = due && collectedDt ? Math.max(0, Math.ceil((collectedDt.getTime() - due.getTime()) / MS_PER_DAY)) : 0;
      }
      const outstandingDays = Math.max(0, totalOverdueDays - alreadyCollectedDays);
      outstanding = outstandingDays * FINE_PER_DAY;

      // update collected_upto to today and clear stored fine
      await connection.query("UPDATE issues SET fine = 0, collected_upto = ? WHERE id = ?", [todayDate, Number(id)]);
      console.log(`[STORE] collectFine updated active issue ${id}, set collected_upto=${todayDate}`);
    }

    await connection.commit();

    return { id: Number(id), collected: outstanding };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getReportSummary(adminId = null) {
  const bookSql = adminId !== null && adminId !== undefined
    ? "SELECT COALESCE(SUM(total_copies), 0) AS totalBooks FROM books WHERE admin_id = ?"
    : "SELECT COALESCE(SUM(total_copies), 0) AS totalBooks FROM books";
  const issueSql = adminId !== null && adminId !== undefined
    ? "SELECT COUNT(*) AS issuedCount FROM issues WHERE status = 'issued' AND admin_id = ?"
    : "SELECT COUNT(*) AS issuedCount FROM issues WHERE status = 'issued'";
  const overdueSql = adminId !== null && adminId !== undefined
    ? "SELECT COUNT(*) AS overdueCount FROM issues WHERE status = 'issued' AND due_date < CURDATE() AND (collected_upto IS NULL OR collected_upto < CURDATE()) AND admin_id = ?"
    : "SELECT COUNT(*) AS overdueCount FROM issues WHERE status = 'issued' AND due_date < CURDATE() AND (collected_upto IS NULL OR collected_upto < CURDATE())";
  const fineSql = adminId !== null && adminId !== undefined
    ? "SELECT COALESCE(SUM(fine), 0) AS fineTotal FROM issues WHERE admin_id = ?"
    : "SELECT COALESCE(SUM(fine), 0) AS fineTotal FROM issues";
  const runningFineSql = adminId !== null && adminId !== undefined
    ? `SELECT COALESCE(SUM(
         GREATEST(
           GREATEST(DATEDIFF(CURDATE(), due_date), 0) - COALESCE(GREATEST(DATEDIFF(collected_upto, due_date), 0), 0),
          0
         ) * ?
      ), 0) AS runningFine FROM issues WHERE status = 'issued' AND admin_id = ?`
    : `SELECT COALESCE(SUM(
         GREATEST(
           GREATEST(DATEDIFF(CURDATE(), due_date), 0) - COALESCE(GREATEST(DATEDIFF(collected_upto, due_date), 0), 0),
          0
         ) * ?
      ), 0) AS runningFine FROM issues WHERE status = 'issued'`;

  const [bookRows, issueRows, overdueRows, fineRows, runningFineRows] = await Promise.all([
    query(bookSql, adminId !== null && adminId !== undefined ? [Number(adminId)] : []),
    query(issueSql, adminId !== null && adminId !== undefined ? [Number(adminId)] : []),
    query(overdueSql, adminId !== null && adminId !== undefined ? [Number(adminId)] : []),
    query(fineSql, adminId !== null && adminId !== undefined ? [Number(adminId)] : []),
    query(runningFineSql, adminId !== null && adminId !== undefined ? [FINE_PER_DAY, Number(adminId)] : [FINE_PER_DAY])
  ]);

  return {
    totalBooks: Number(bookRows[0]?.totalBooks || 0),
    issuedBooks: Number(issueRows[0]?.issuedCount || 0),
    overdueBooks: Number(overdueRows[0]?.overdueCount || 0),
    totalFine: Number(fineRows[0]?.fineTotal || 0) + Number(runningFineRows[0]?.runningFine || 0)
  };
}

module.exports = {
  initializeDatabase,
  getAdmin,
  adminEmailExists,
  updateAdmin,
  getAdminById,
  createAdmin,
  getStudentByStudentId,
  deleteStudent,
  undeleteStudent,
  blockStudent,
  unblockStudent,
  getAllStudents,
  getStudent,
  studentExists,
  createStudent,
  updateStudent,
  getAllBooks,
  getBook,
  bookIsbnExists,
  createBook,
  updateBook,
  deleteBook,
  getAllIssues,
  getIssue,
  createIssue,
  returnIssue,
  collectFine,
  getReportSummary
};