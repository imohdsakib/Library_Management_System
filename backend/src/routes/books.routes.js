const express = require("express");
const store = require("../lib/mysqlStore");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();

  try {
    const adminId = req.user && req.user.id ? req.user.id : null;
    const books = await store.getAllBooks(adminId);

    const filtered = q
      ? books.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
      : books;

    return res.json(filtered);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch books", error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { title, author, isbn, category, totalCopies, publishedYear } = req.body;
  if (!title || !author || !category || totalCopies == null) {
    return res.status(400).json({ message: "title, author, category, totalCopies are required" });
  }

  const total = Number(totalCopies);
  if (Number.isNaN(total) || total < 0) {
    return res.status(400).json({ message: "totalCopies must be a non-negative number" });
  }

  try {
    const isbnVal = (isbn || '').trim();
    const adminId = req.user && req.user.id ? req.user.id : null;
    if (isbnVal) {
      const exists = await store.bookIsbnExists(isbnVal, undefined, adminId);
      if (exists) {
        return res.status(409).json({ message: "ISBN already exists" });
      }
    }

    const book = await store.createBook(
      title.trim(),
      author.trim(),
      isbnVal || null,
      category.trim(),
      total,
      publishedYear || null,
      adminId
    );

    return res.status(201).json({ id: book.id, message: "Book created" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create book", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, isbn, category, totalCopies, publishedYear } = req.body;

  if (!title || !author || !category || totalCopies == null) {
    return res.status(400).json({ message: "title, author, category, totalCopies are required" });
  }

  const total = Number(totalCopies);
  if (Number.isNaN(total) || total < 0) {
    return res.status(400).json({ message: "totalCopies must be a non-negative number" });
  }

  try {
    const isbnVal = (isbn || '').trim();
    const adminId = req.user && req.user.id ? req.user.id : null;
    if (isbnVal) {
      const dupes = await store.bookIsbnExists(isbnVal, Number(id), adminId);
      if (dupes) {
        return res.status(409).json({ message: "ISBN already exists" });
      }
    }

    const book = await store.updateBook(
      id,
      title.trim(),
      author.trim(),
      isbnVal || null,
      category.trim(),
      total,
      publishedYear || null,
      adminId
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.json({ message: "Book updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update book", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const adminId = req.user && req.user.id ? req.user.id : null;
    const deleted = await store.deleteBook(id, adminId);
    if (!deleted) {
      return res.status(404).json({ message: "Book not found or has active issues" });
    }
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete book", error: err.message });
  }
});

module.exports = router;
