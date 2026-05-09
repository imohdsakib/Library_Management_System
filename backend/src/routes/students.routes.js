const express = require("express");
const store = require("../lib/mysqlStore");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  try {
    const students = await store.getAllStudents();
    return res.json(students);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch students", error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { name, studentId, email, phone, course } = req.body;
  if (!name || !studentId || !email) {
    return res.status(400).json({ message: "name, studentId, email are required" });
  }

  try {
    const exists = await store.studentExists(studentId.trim(), email.toLowerCase().trim());
    if (exists) {
      return res.status(409).json({ message: "Student ID or email already exists" });
    }

    const student = await store.createStudent(
      name.trim(),
      studentId.trim(),
      email.toLowerCase().trim(),
      phone || null,
      course || null
    );

    return res.status(201).json({ id: student.id, message: "Student created" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create student", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, studentId, email, phone, course } = req.body;

  if (!name || !studentId || !email) {
    return res.status(400).json({ message: "name, studentId, email are required" });
  }

  try {
    const exists = await store.studentExists(studentId.trim(), email.toLowerCase().trim(), Number(id));
    if (exists) {
      return res.status(409).json({ message: "Student ID or email already exists" });
    }

    const student = await store.updateStudent(
      id,
      name.trim(),
      studentId.trim(),
      email.toLowerCase().trim(),
      phone || null,
      course || null
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
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const { id } = req.params;
    const ok = await store.deleteStudent(Number(id));
    if (!ok) return res.status(409).json({ message: "Cannot delete student with existing issues" });
    return res.json({ message: "Student deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete student", error: err.message });
  }
});

// Block student (admin only)
router.post("/:id/block", async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const { id } = req.params;
    const ok = await store.blockStudent(Number(id));
    if (!ok) return res.status(404).json({ message: "Student not found" });
    return res.json({ message: "Student blocked" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to block student", error: err.message });
  }
});

// Unblock student (admin only)
router.post("/:id/unblock", async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const { id } = req.params;
    const ok = await store.unblockStudent(Number(id));
    if (!ok) return res.status(404).json({ message: "Student not found" });
    return res.json({ message: "Student unblocked" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to unblock student", error: err.message });
  }
});

// Restore/Undelete student (admin only)
router.post("/:id/restore", async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const { id } = req.params;
    const ok = await store.undeleteStudent(Number(id));
    if (!ok) return res.status(404).json({ message: "Student not found or not deleted" });
    return res.json({ message: "Student restored" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to restore student", error: err.message });
  }
});

module.exports = router;
