const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const FINE_PER_DAY = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

function formatDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function toUtcDateOnly(value) {
  if (!value) {
    return null;
  }

  const dateString = formatDate(value);
  if (!dateString) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);
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
      phone VARCHAR(30) NULL,
      course VARCHAR(120) NULL,
      created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
      blocked TINYINT(1) NOT NULL DEFAULT 0,
      deleted_at DATE NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      author VARCHAR(200) NOT NULL,
      isbn VARCHAR(80) NOT NULL UNIQUE,
      category VARCHAR(120) NOT NULL,
      total_copies INT NOT NULL DEFAULT 0,
      available_copies INT NOT NULL DEFAULT 0,
      published_year INT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

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
      CONSTRAINT fk_issues_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_issues_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
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
      await ensureDatabaseExists();
      pool = mysql.createPool(dbConfig);
      await ensureSchema();
      await ensureDefaultAdmin();
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

async function getAllStudents() {
  const rows = await query(
    "SELECT id, name, student_id AS studentId, email, phone, course, created_at AS createdAt, blocked, deleted_at AS deletedAt FROM students WHERE deleted_at IS NULL ORDER BY id DESC"
  );

  return rows.map((row) => ({
    ...row,
    createdAt: formatDate(row.createdAt)
  }));
}

async function getStudent(id) {
  const rows = await query("SELECT * FROM students WHERE id = ? LIMIT 1", [Number(id)]);
  return rows[0] || null;
}

async function deleteStudent(id) {
  // soft delete: set deleted_at to today
  const result = await query("UPDATE students SET deleted_at = CURDATE() WHERE id = ? AND deleted_at IS NULL", [Number(id)]);
  return result.affectedRows > 0;
}

async function undeleteStudent(id) {
  // restore: clear deleted_at
  const result = await query("UPDATE students SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL", [Number(id)]);
  return result.affectedRows > 0;
}

async function blockStudent(id) {
  const result = await query("UPDATE students SET blocked = 1 WHERE id = ?", [Number(id)]);
  return result.affectedRows > 0;
}

async function unblockStudent(id) {
  const result = await query("UPDATE students SET blocked = 0 WHERE id = ?", [Number(id)]);
  return result.affectedRows > 0;
}

async function studentExists(studentId, email, excludeId = null) {
  const params = [studentId, email.toLowerCase()];
  let sql = "SELECT id FROM students WHERE (student_id = ? OR email = ?)";

  if (excludeId !== null && excludeId !== undefined) {
    sql += " AND id <> ?";
    params.push(Number(excludeId));
  }

  const rows = await query(sql, params);
  return rows.length > 0;
}

async function createStudent(name, studentId, email, phone, course) {
  const result = await query(
    "INSERT INTO students (name, student_id, email, phone, course, created_at) VALUES (?, ?, ?, ?, ?, CURDATE())",
    [name, studentId, email.toLowerCase(), phone || null, course || null]
  );

  return {
    id: result.insertId,
    name,
    student_id: studentId,
    email: email.toLowerCase(),
    phone: phone || null,
    course: course || null
  };
}

async function updateStudent(id, name, studentId, email, phone, course) {
  const result = await query(
    "UPDATE students SET name = ?, student_id = ?, email = ?, phone = ?, course = ? WHERE id = ?",
    [name, studentId, email.toLowerCase(), phone || null, course || null, Number(id)]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getStudent(id);
}

async function getAllBooks() {
  const rows = await query(
    "SELECT id, title, author, isbn, category, total_copies AS totalCopies, available_copies AS availableCopies, published_year AS publishedYear FROM books ORDER BY id DESC"
  );

  return rows.map((row) => ({
    ...row,
    totalCopies: Number(row.totalCopies),
    availableCopies: Number(row.availableCopies)
  }));
}

async function getBook(id) {
  const rows = await query("SELECT * FROM books WHERE id = ? LIMIT 1", [Number(id)]);
  return rows[0] || null;
}

async function bookIsbnExists(isbn, excludeId = null) {
  const params = [isbn];
  let sql = "SELECT id FROM books WHERE isbn = ?";

  if (excludeId !== null && excludeId !== undefined) {
    sql += " AND id <> ?";
    params.push(Number(excludeId));
  }

  const rows = await query(sql, params);
  return rows.length > 0;
}

async function createBook(title, author, isbn, category, totalCopies, publishedYear) {
  const result = await query(
    "INSERT INTO books (title, author, isbn, category, total_copies, available_copies, published_year) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, author, isbn, category, Number(totalCopies), Number(totalCopies), publishedYear || null]
  );

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

async function updateBook(id, title, author, isbn, category, totalCopies, publishedYear) {
  const book = await getBook(id);
  if (!book) {
    return null;
  }

  const issuedCount = Number(book.total_copies) - Number(book.available_copies);
  const nextAvailable = Math.max(Number(totalCopies) - issuedCount, 0);

  const result = await query(
    "UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, total_copies = ?, available_copies = ?, published_year = ? WHERE id = ?",
    [title, author, isbn, category, Number(totalCopies), nextAvailable, publishedYear || null, Number(id)]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getBook(id);
}

async function deleteBook(id) {
  const activeRows = await query("SELECT id FROM issues WHERE book_id = ? AND status = 'issued' LIMIT 1", [Number(id)]);
  if (activeRows.length > 0) {
    return false;
  }

  const result = await query("DELETE FROM books WHERE id = ?", [Number(id)]);
  return result.affectedRows > 0;
}

async function getAllIssues() {
  const rows = await query(
    `SELECT
      i.id,
      i.book_id AS bookId,
      i.student_id AS studentId,
      i.issue_date AS issueDate,
      i.due_date AS dueDate,
      i.return_date AS returnDate,
      i.status,
      i.fine,
      b.title AS bookTitle,
      s.name AS studentName,
      s.student_id AS studentCode
    FROM issues i
    INNER JOIN books b ON b.id = i.book_id
    INNER JOIN students s ON s.id = i.student_id
    ORDER BY i.id DESC`
  );

  return rows.map((row) => ({
    ...row,
    issueDate: formatDate(row.issueDate),
    dueDate: formatDate(row.dueDate),
    returnDate: formatDate(row.returnDate),
    fine: Number(row.fine || 0)
  }));
}

async function getIssue(id) {
  const rows = await query("SELECT * FROM issues WHERE id = ? LIMIT 1", [Number(id)]);
  return rows[0] || null;
}

async function createIssue(bookId, studentId, dueDate) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [bookRows] = await connection.query("SELECT * FROM books WHERE id = ? FOR UPDATE", [Number(bookId)]);
    const book = bookRows[0];
    if (!book || Number(book.available_copies) < 1) {
      await connection.rollback();
      return null;
    }

    const [studentRows] = await connection.query("SELECT id FROM students WHERE id = ? LIMIT 1", [Number(studentId)]);
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

async function getReportSummary() {
  const [bookRows, issueRows, overdueRows, fineRows, runningFineRows] = await Promise.all([
    query("SELECT COALESCE(SUM(total_copies), 0) AS totalBooks FROM books"),
    query("SELECT COUNT(*) AS issuedCount FROM issues WHERE status = 'issued'"),
    query("SELECT COUNT(*) AS overdueCount FROM issues WHERE status = 'issued' AND due_date < CURDATE()"),
    query("SELECT COALESCE(SUM(fine), 0) AS fineTotal FROM issues"),
    query("SELECT COALESCE(SUM(GREATEST(DATEDIFF(CURDATE(), due_date), 0) * ?), 0) AS runningFine FROM issues WHERE status = 'issued'", [FINE_PER_DAY])
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
  getReportSummary
};