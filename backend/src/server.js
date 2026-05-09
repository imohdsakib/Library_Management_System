require("dotenv").config({ override: true });
const express = require("express");
const cors = require("cors");
const store = require("./lib/mysqlStore");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/students.routes");
const bookRoutes = require("./routes/books.routes");
const issueRoutes = require("./routes/issues.routes");
const reportRoutes = require("./routes/reports.routes");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await store.getReportSummary();
    return res.json({ ok: true, message: "Server and MySQL are healthy" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "MySQL unavailable", error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const port = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await store.initializeDatabase();
    console.log("MySQL initialized successfully");
  } catch (error) {
    console.error("Failed to initialize MySQL:", error.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`LMS backend running on http://localhost:${port}`);
  });
}

startServer();
