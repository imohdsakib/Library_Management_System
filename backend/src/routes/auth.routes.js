const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const store = require("../lib/mysqlStore");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

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

