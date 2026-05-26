const express = require("express");
const store = require("../lib/mysqlStore");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Temporary debug route (unprotected) to inspect issues during debugging.
router.get('/_debug/all', async (_req, res) => {
  try {
    console.log('[DEBUG] /api/issues/_debug/all called');
    const issues = await store.getAllIssues();
    return res.json(issues);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch issues (debug)', error: err.message });
  }
});

router.use(requireAuth);

router.get("/", async (_req, res) => {
  try {
    const adminId = _req.user && _req.user.role === 'admin' ? _req.user.id : null;
    const issues = await store.getAllIssues(adminId);
    if (_req.user && _req.user.role === "student") {
      return res.json(issues.filter((issue) => String(issue.studentId) === String(_req.user.id)));
    }

    return res.json(issues);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch issues", error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { bookId, studentId, dueDate } = req.body;
  if (!bookId || !studentId || !dueDate) {
    return res.status(400).json({ message: "bookId, studentId, dueDate are required" });
  }

  try {
    const adminId = req.user && req.user.role === 'admin' ? req.user.id : null;
    const issue = await store.createIssue(bookId, studentId, dueDate, adminId);
    if (!issue) {
      return res.status(400).json({ message: "Book unavailable or student not found" });
    }
    return res.status(201).json({ message: "Book issued" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to issue book", error: err.message });
  }
});

router.post("/:id/return", async (req, res) => {
  const { id } = req.params;

  try {
    const issue = await store.returnIssue(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found or already returned" });
    }
    return res.json({ message: "Book returned", fine: issue.fine });
  } catch (err) {
    return res.status(500).json({ message: "Failed to return book", error: err.message });
  }
});

router.post("/:id/collect", async (req, res) => {
  const { id } = req.params;
  console.log(`[ROUTE] collect called for issue ${id} by user ${JSON.stringify(req.user || {})}`);

  try {
    const adminId = req.user && req.user.role === 'admin' ? req.user.id : null;
    const issue = await store.getIssue(id, adminId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // allow admin or the student who owns the issue to collect fine
    const user = req.user || {};
    if (user.role !== 'admin' && String(user.id) !== String(issue.student_id)) {
      return res.status(403).json({ message: 'Not authorized to collect this fine' });
    }

    const result = await store.collectFine(id);
    console.log(`[ROUTE] collect result for issue ${id}: ${JSON.stringify(result)}`);
    if (!result) return res.status(404).json({ message: 'Failed to collect fine' });

    return res.json({ message: 'Fine collected', collected: result.collected });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to collect fine', error: err.message });
  }
});

module.exports = router;
