# Library Management System

A complete web-based library management application built with vanilla HTML/CSS/JavaScript frontend and Node.js + Express + MySQL backend.

## Features

- **Admin Authentication** - Secure login and registration with JWT tokens
- **Student Management** - Add, edit, block/unblock, soft-delete, and restore student records
- **Book Management** - Maintain book catalog with ISBN, category, copies tracking
- **Book Issues/Returns** - Track book issuance and returns with due dates
- **Fine Calculation** - Automatic fine calculation for overdue books
- **Reports & Dashboard** - Summary reports, overdue analytics, and blocked student list
- **Admin Profile Management** - Update admin details including password
- **Responsive Design** - Works on desktop and mobile devices

## Project Structure

```
Library_Management_System/
├── frontend/                 (Vanilla HTML/CSS/JS)
│   ├── index.html           (Main UI with all modules)
│   ├── style.css            (Responsive styles)
│   └── script.js            (App logic, API calls)
├── backend/                 (Node.js + Express)
│   ├── src/
│   │   ├── server.js        (Express app entry)
│   │   ├── lib/
│   │   │   └── mysqlStore.js (Database CRUD operations)
│   │   ├── routes/          (API endpoints)
│   │   │   ├── auth.routes.js
│   │   │   ├── students.routes.js
│   │   │   ├── books.routes.js
│   │   │   ├── issues.routes.js
│   │   │   └── reports.routes.js
│   │   └── middleware/
│   │       └── auth.js      (JWT verification)
│   ├── .env                 (Database credentials)
│   ├── package.json
├── database/
│   └── schema.sql           (MySQL table definitions)
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8.x |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **API** | RESTful API with CORS |

## Prerequisites

- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **MySQL Server** (v8.0+) - [Download](https://dev.mysql.com/downloads/mysql/)
- **Windows PowerShell** or Terminal (for running scripts)

## Installation & Setup

### 1. Clone/Setup Project
```bash
cd Library_Management_System
```

### 2. Database Setup
Open MySQL Workbench or MySQL CLI and run:
```sql
CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;
```
Then execute the schema from `database/schema.sql` to create all tables.

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file with database credentials
# Edit .env and add:
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=library_management
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=*
DEFAULT_ADMIN_NAME=Library Admin
DEFAULT_ADMIN_EMAIL=admin@library.com
DEFAULT_ADMIN_PASSWORD=use-a-strong-local-password
DEFAULT_ADMIN_PHONE=9999999999

# Start backend
npm start
```

Backend runs on `http://localhost:5000`

### 4. Frontend Setup
```bash
# Open frontend/index.html in a web browser
# Or use a local server:
cd frontend
npx http-server
```

Frontend runs on `http://localhost:8080` (or wherever you serve it)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register-admin` - Register new admin
- `PUT /api/auth/me` - Update current admin profile

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Add new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Soft-delete student
- `POST /api/students/:id/block` - Block student
- `POST /api/students/:id/unblock` - Unblock student
- `POST /api/students/:id/restore` - Restore deleted student

### Books
- `GET /api/books` - Get all books (with optional search query)
- `POST /api/books` - Add new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Issues
- `GET /api/issues` - Get all book issues
- `POST /api/issues` - Issue book to student
- `POST /api/issues/:id/return` - Return book

### Reports
- `GET /api/reports/summary` - Get dashboard summary
- Reports include issued, overdue, fine totals, and blocked students list in the UI

## Default Admin Credentials

- **Email**: admin@library.com
- **Password**: set locally in `.env` (default local dev password may be configured there)

Change these after first login!

## Troubleshooting

### MySQL Connection Error
- Ensure MySQL is running
- Check `.env` credentials match your MySQL setup
- Verify database exists: `SHOW DATABASES;`

### "Port 5000 already in use"
- Change `PORT` in `.env` to another port like 5001

### Frontend can't reach backend
- Check backend is running on correct port
- Verify `CORS_ORIGIN` in `.env` allows frontend URL
- Check browser console for error messages

## Development Notes

- Frontend uses localStorage for JWT token storage
- All database queries use parameterized queries (SQL injection safe)
- Passwords are hashed using bcryptjs
- JWT tokens expire based on backend configuration
- Students support block/unblock and soft-delete/restore workflows
- Current database tables: `admins`, `students`, `books`, `issues`

## Author

Created as a Library Management System assignment.

## License

MIT
