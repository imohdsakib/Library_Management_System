const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const store = require("../lib/mysqlStore");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const crypto = require('crypto');
const storeHelpers = require('../lib/mysqlStore');
const nodemailer = require('nodemailer');

// configure mailer if SMTP settings present
let mailer = null;
if (process.env.SMTP_USER) {
  try {
    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: (process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } catch (e) {
    console.error('[AUTH] Failed to configure mailer', e.message);
    mailer = null;
  }
}

router.post("/register-admin", async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password are required" });
  }

  try {
    const existing = await store.getAdmin(email);
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const admin = await store.createAdmin(name.trim(), email.toLowerCase().trim(), hash, phone);

    return res.status(201).json({ id: admin.id, message: "Admin registered" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to register admin", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const admin = await store.getAdmin(email);

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, role: "admin", email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin"
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// Forgot password - create reset token and (console) send link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: 'email is required' });

  try {
    const admin = await store.getAdmin(email);
    if (!admin) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });

    // generate token
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await store.createPasswordReset(admin.email, token, expiresAt);

    // Build absolute reset link so email clients don't resolve it against their own domain
    const frontendBase = (process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
    const resetLink = `${frontendBase}/reset.html?token=${token}`;

    // Try to send email using configured SMTP. If not configured and not in
    // production, create an Ethereal test account so developers can preview
    // the message via a preview URL.
    try {
      let transporter = mailer;
      let usedEthereal = false;

      if (!transporter && (process.env.NODE_ENV || '').toLowerCase() !== 'production') {
        // create an Ethereal test account on demand
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        usedEthereal = true;
        console.log('[AUTH] Using Ethereal test account for password reset (dev)');
      }

      if (transporter) {
        const fromAddr = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@library.local';
        const info = await transporter.sendMail({
          from: fromAddr,
          to: admin.email,
          subject: 'Library Management System - Password Reset',
          html: `<p>We received a request to reset your admin password. Click the link below to set a new password (link valid for 1 hour):</p>
                 <p><a href="${resetLink}">${resetLink}</a></p>
                 <p>If you didn't request this, ignore this email.</p>`
        });

        console.log(`[AUTH] Sent password reset email to ${admin.email}`);

        if (usedEthereal) {
          const previewUrl = nodemailer.getTestMessageUrl(info);
          return res.json({ message: 'Password reset email sent (ethereal).', previewUrl });
        }

        return res.json({ message: 'Password reset email sent. Check your inbox.' });
      }
    } catch (mailErr) {
      console.error('[AUTH] Failed to send reset email', mailErr && mailErr.message);
      // fallback to console/logging below
    }

    // Console fallback for development: log the link and return token for convenience
    console.log(`[AUTH] Password reset for ${admin.email}: ${resetLink}`);
    return res.json({ message: 'Password reset initiated. Check server logs or your email (if configured).', token });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create reset token', error: err.message });
  }
});

// Reset password using token
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ message: 'token and password are required' });

  try {
    const resetRow = await store.getPasswordResetByToken(token);
    if (!resetRow) return res.status(400).json({ message: 'Invalid token' });
    if (resetRow.used) return res.status(400).json({ message: 'Token already used' });
    if (new Date(resetRow.expires_at) < new Date()) return res.status(400).json({ message: 'Token expired' });

    const passwordHash = await bcrypt.hash(password, 10);
    // update admin password by email
    const updated = await store.updateAdminPasswordByEmail(resetRow.email, passwordHash);
    if (!updated) return res.status(500).json({ message: 'Failed to update password' });

    await store.markPasswordResetUsed(token);
    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    return res.status(500).json({ message: 'Reset failed', error: err.message });
  }
});

router.post("/student-login", async (req, res) => {
  const { studentId, password } = req.body;

  if (!studentId || !password) {
    return res.status(400).json({ message: "studentId and password are required" });
  }

  try {
    const student = await store.getStudentByStudentId(studentId.trim());

    if (!student || student.deleted_at) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (student.blocked) {
      return res.status(403).json({ message: "Student account is blocked" });
    }

    if (!student.password_hash) {
      return res.status(403).json({ message: "Password not set. Ask admin to reset it." });
    }

    const ok = await bcrypt.compare(password, student.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: student.id,
        role: "student",
        studentId: student.student_id,
        email: student.email,
        name: student.name,
        phone: student.phone,
        course: student.course
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        course: student.course,
        studentId: student.student_id,
        role: "student"
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Student login failed", error: err.message });
  }
});

// Update current admin details (protected)
router.put("/me", requireAuth, async (req, res) => {
  try {
    const payload = req.user || {};
    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const adminId = payload.id;
    const { name, email, phone, password } = req.body;

    if (email) {
      const exists = await store.adminEmailExists(email, adminId);
      if (exists) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    let passwordHash = undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await store.updateAdmin(adminId, name, email, phone, passwordHash);
    if (!updated) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.json({ id: updated.id, name: updated.name, email: updated.email, phone: updated.phone });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update admin", error: err.message });
  }
});

module.exports = router;

