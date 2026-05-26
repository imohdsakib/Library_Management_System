const express = require("express");
const bcrypt = require("bcryptjs");
const store = require("../lib/mysqlStore");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function requireAdmin(req, res) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }

  return true;
}

router.get("/", async (_req, res) => {
  try {
    if (_req.user.role === "admin") {
      const adminId = _req.user && _req.user.id ? _req.user.id : null;
      const students = await store.getAllStudents(adminId);
      return res.json(students);
    }

    const student = await store.getStudent(_req.user.id);
    if (!student || student.deleted_at) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { password_hash, ...safeStudent } = student;
    return res.json([{
      ...safeStudent,
      studentId: safeStudent.student_id,
      createdAt: safeStudent.created_at
    }]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch students", error: err.message });
  }
});

router.post("/", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { name, studentId, email, phone, course, password } = req.body;
  if (!name || !studentId || !email || !password) {
    return res.status(400).json({ message: "name, studentId, email and password are required" });
  }

  try {
    const adminId = req.user && req.user.id ? req.user.id : null;
    const exists = await store.studentExists(studentId.trim(), email.toLowerCase().trim(), null, adminId);
    if (exists) {
      return res.status(409).json({ message: "Student ID or email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const student = await store.createStudent(
      name.trim(),
      studentId.trim(),
      email.toLowerCase().trim(),
      phone || null,
      course || null,
      passwordHash,
      adminId
    );

    return res.status(201).json({ id: student.id, message: "Student created" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create student", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { id } = req.params;
  const { name, studentId, email, phone, course, password } = req.body;

  if (!name || !studentId || !email) {
    return res.status(400).json({ message: "name, studentId, email are required" });
  }

  try {
    const adminId = req.user && req.user.id ? req.user.id : null;
    const exists = await store.studentExists(studentId.trim(), email.toLowerCase().trim(), Number(id), adminId);
    if (exists) {
      return res.status(409).json({ message: "Student ID or email already exists" });
    }

    const student = await store.updateStudent(
      id,
      name.trim(),
      studentId.trim(),
      email.toLowerCase().trim(),
      phone || null,
      course || null,
      password ? await bcrypt.hash(password, 10) : undefined,
      adminId
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({ message: "Student updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update student", error: err.message });
  }
});

// Delete student (admin only)
router.delete("/:id", async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    const adminId = req.user && req.user.id ? req.user.id : null;
    const ok = await store.deleteStudent(Number(id), adminId);
    if (!ok) return res.status(409).json({ message: "Cannot delete student with existing issues" });
    return res.json({ message: "Student deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete student", error: err.message });
  }
});

// Block student (admin only)
router.post("/:id/block", async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    const adminId = req.user && req.user.id ? req.user.id : null;
    const ok = await store.blockStudent(Number(id), adminId);
    if (!ok) return res.status(404).json({ message: "Student not found" });
    return res.json({ message: "Student blocked" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to block student", error: err.message });
  }
});

// Unblock student (admin only)
router.post("/:id/unblock", async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    const adminId = req.user && req.user.id ? req.user.id : null;
    const ok = await store.unblockStudent(Number(id), adminId);
    if (!ok) return res.status(404).json({ message: "Student not found" });
    return res.json({ message: "Student unblocked" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to unblock student", error: err.message });
  }
});

// Restore/Undelete student (admin only)
router.post("/:id/restore", async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    const adminId = req.user && req.user.id ? req.user.id : null;
    const ok = await store.undeleteStudent(Number(id), adminId);
    if (!ok) return res.status(404).json({ message: "Student not found or not deleted" });
    return res.json({ message: "Student restored" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to restore student", error: err.message });
  }
});

module.exports = router;
