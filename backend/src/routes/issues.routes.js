const express = require("express");
const store = require("../lib/mysqlStore");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  try {
    const issues = await store.getAllIssues();
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
    const issue = await store.createIssue(bookId, studentId, dueDate);
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

module.exports = router;
