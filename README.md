# Library Management System

A compact Library Management System (LMS) — web application for managing books, students, issues/returns, and fines.

## Project Introduction

This repository contains a simple LMS built for small libraries and educational institutions. It provides admin authentication, student management, book cataloging, issuing/return workflows with due dates and automatic fine calculation, and basic reports.

## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)
- Backend: Node.js, Express.js
- Database: MySQL (access via `mysql2`)
- Authentication: JWT (`jsonwebtoken`) + `bcryptjs` for password hashing
- Utilities: `cors`, `dotenv`
- Dev tooling: `nodemon` (devDependency)

Files of interest: `frontend/index.html`, `frontend/style.css`, `frontend/script.js`, `backend/src/server.js`, `backend/src/lib/mysqlStore.js`, `database/schema.sql`.

---
