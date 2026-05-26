const express = require("express");
const store = require("../lib/mysqlStore");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/summary", async (_req, res) => {
  try {
    const adminId = _req.user && _req.user.role === 'admin' ? _req.user.id : null;
    const summary = await store.getReportSummary(adminId);
    return res.json(summary);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch report summary", error: err.message });
  }
});

module.exports = router;
