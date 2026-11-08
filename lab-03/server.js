// server.js
// Express REST API with SQLite database for Lab 3:
// Advanced Query Parameters, Validation, Whitelisting, and Debugging
const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "books.db");

// Middleware to parse incoming JSON request payloads
app.use(express.json());

let db = null;

// Realistic sample books dataset (15 books) for seeding
const sampleBooks = [
  { title: "The Pragmatic Programmer", author: "David Thomas, Andrew Hunt", price: 750, pages: 352 },
  { title: "Clean Code", author: "Robert C. Martin", price: 650, pages: 464 },
  { title: "You Don't Know JS: Scope & Closures", author: "Kyle Simpson", price: 420, pages: 144 },
  { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", price: 1200, pages: 616 },
  { title: "JavaScript: The Good Parts", author: "Douglas Crockford", price: 380, pages: 176 },
  { title: "Atomic Habits", author: "James Clear", price: 450, pages: 320 },
  { title: "Node.js Design Patterns", author: "Mario Casciaro", price: 890, pages: 660 },
  { title: "Learning SQL", author: "Alan Beaulieu", price: 550, pages: 380 },
  { title: "Introduction to Algorithms", author: "Thomas H. Cormen", price: 1400, pages: 1312 },
  { title: "Refactoring: Improving the Design of Existing Code", author: "Martin Fowler", price: 790, pages: 448 },
  { title: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", price: 950, pages: 687 },
  { title: "Head First Design Patterns", author: "Eric Freeman", price: 720, pages: 694 },
  { title: "Eloquent JavaScript", author: "Marijn Haverbeke", price: 499, pages: 472 },
  { title: "Clean Architecture", author: "Robert C. Martin", price: 680, pages: 432 },
  { title: "Database System Concepts", author: "Abraham Silberschatz", price: 1150, pages: 1376 },
];

// Asynchronous initialization routine for database connection and server startup
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create the 'book' table if it does not already exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    // Ensure database contains at least 15 varied book records for testing
    const countResult = await db.get("SELECT COUNT(*) as total FROM book;");
    if (countResult.total < 15) {
      await db.exec("DELETE FROM book;");
      await db.exec("DELETE FROM sqlite_sequence WHERE name='book';");

      const insertStmt = await db.prepare(
        "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);"
      );
      for (const book of sampleBooks) {
        await insertStmt.run(book.title, book.author, book.price, book.pages);
      }
      await insertStmt.finalize();
      console.log("Seeded database with 15 realistic book records.");
    }

    const server = app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });

    // Friendly error handling for port conflicts (EADDRINUSE)
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `[Port Conflict] Port ${PORT} is already in use. Please terminate the process using this port or specify another port using PORT=<number>.`
        );
      } else {
        console.error(`[Server Error] ${error.message}`);
      }
    });
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// ==============================================================================
// ROOT ROUTE - API DIRECTORY & STUDENT INFO
// ==============================================================================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Backend Development Fundamentals - Lab 3 (REST API, Query Parameters, Validation & Debugging)",
    student: "Vankadari Roopesh",
    registrationNumber: "252U1R1249",
    section: "CSE - 2E - 211",
    college: "Aurora Deemed-to-be-University",
    faculty: "Mr Yugandhar Gurjalwar",
    endpoints: {
      listBooksWithFilters: "GET /books/?search_q=&order_by=id&order=ASC&limit=10&offset=0&min_price=&max_price=",
      getSingleBook: "GET /books/:id",
      addBook: "POST /books/",
      updateBook: "PUT /books/:id",
      deleteBook: "DELETE /books/:id"
    }
  });
});

// ==============================================================================
// REQUEST BODY VALIDATOR HELPER FUNCTION
// ==============================================================================
const validateBookBody = (body) => {
  const { title, author, price, pages } = body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return "title is required";
  }

  if (!author || typeof author !== "string" || author.trim() === "") {
    return "author is required";
  }

  if (price === undefined || typeof price !== "number" || isNaN(price) || price < 0) {
    return "price is required and must be a non-negative number";
  }

  if (pages !== undefined && (!Number.isInteger(pages) || pages <= 0)) {
    return "pages must be a positive integer";
  }

  return null;
};

// ==============================================================================
// REST ENDPOINTS
// ==============================================================================

// 1. GET /books/ - Retrieve books with Search, Ordering, Pagination, and Price Filters
app.get(["/books", "/books/"], async (req, res, next) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price,
    } = req.query;

    // --- SECURITY: ORDER_BY & ORDER WHITELIST VALIDATION ---
    // SQL ? placeholders only bind literal data values, NOT column names or keywords.
    // To prevent SQL injection, order_by and order must be whitelisted in JavaScript.
    const allowedOrderBy = ["id", "title", "author", "price", "pages"];
    const normalizedOrderBy = order_by.toLowerCase();
    if (!allowedOrderBy.includes(normalizedOrderBy)) {
      return res.status(400).json({
        message: `Invalid order_by field. Allowed fields: ${allowedOrderBy.join(", ")}`,
      });
    }

    const normalizedOrder = order.toUpperCase();
    if (normalizedOrder !== "ASC" && normalizedOrder !== "DESC") {
      return res.status(400).json({
        message: "Invalid order value. Allowed values: ASC, DESC",
      });
    }

    // --- PAGINATION VALIDATION ---
    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 0) {
      return res.status(400).json({
        message: "limit must be a non-negative integer",
      });
    }

    const parsedOffset = Number(offset);
    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        message: "offset must be a non-negative integer",
      });
    }

    // --- PRICE FILTER VALIDATION ---
    if (min_price !== undefined) {
      const parsedMin = Number(min_price);
      if (isNaN(parsedMin) || parsedMin < 0) {
        return res.status(400).json({
          message: "min_price must be a non-negative number",
        });
      }
    }

    if (max_price !== undefined) {
      const parsedMax = Number(max_price);
      if (isNaN(parsedMax) || parsedMax < 0) {
        return res.status(400).json({
          message: "max_price must be a non-negative number",
        });
      }
    }

    if (min_price !== undefined && max_price !== undefined) {
      if (Number(min_price) > Number(max_price)) {
        return res.status(400).json({
          message: "min_price cannot be greater than max_price",
        });
      }
    }

    // --- SQL QUERY CONSTRUCTION (Strict Parameterization with ?) ---
    const conditions = [];
    const queryParams = [];

    // Partial search on title using LIKE with ? parameter
    if (search_q.trim() !== "") {
      conditions.push("title LIKE ?");
      queryParams.push(`%${search_q.trim()}%`);
    }

    // Price range filtering (BETWEEN or separate conditions)
    if (min_price !== undefined && max_price !== undefined) {
      conditions.push("price BETWEEN ? AND ?");
      queryParams.push(Number(min_price), Number(max_price));
    } else if (min_price !== undefined) {
      conditions.push("price >= ?");
      queryParams.push(Number(min_price));
    } else if (max_price !== undefined) {
      conditions.push("price <= ?");
      queryParams.push(Number(max_price));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Assemble SQL using whitelisted identifiers and ? parameterized data values
    const query = `
      SELECT * FROM book
      ${whereClause}
      ORDER BY ${normalizedOrderBy} ${normalizedOrder}
      LIMIT ? OFFSET ?;
    `;
    queryParams.push(parsedLimit, parsedOffset);

    const books = await db.all(query, queryParams);
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
});

// 2. GET /books/:id - Retrieve a single book by ID
app.get(["/books/:id", "/books/:id/"], async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const parsedId = Number(rawId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        message: "Invalid bookId format. Must be a positive integer",
      });
    }

    const query = "SELECT * FROM book WHERE id = ?;";
    const book = await db.get(query, [parsedId]);

    if (!book) {
      return res.status(404).json({
        message: `Book with ID ${parsedId} not found`,
      });
    }

    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
});

// 3. POST /books/ - Create and insert a new book record
app.post(["/books", "/books/"], async (req, res, next) => {
  try {
    const validationError = validateBookBody(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { title, author, price, pages = 100 } = req.body;

    const query = "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);";
    const result = await db.run(query, [title.trim(), author.trim(), price, pages]);

    res.status(201).json({
      message: "Book Added Successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    next(error);
  }
});

// 4. PUT /books/:id - Update an existing book record by ID
app.put(["/books/:id", "/books/:id/"], async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const parsedId = Number(rawId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        message: "Invalid bookId format. Must be a positive integer",
      });
    }

    // Verify record exists before updating
    const existingBook = await db.get("SELECT * FROM book WHERE id = ?;", [parsedId]);
    if (!existingBook) {
      return res.status(404).json({
        message: `Book with ID ${parsedId} not found`,
      });
    }

    const validationError = validateBookBody(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { title, author, price, pages = existingBook.pages } = req.body;

    const query = "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;";
    await db.run(query, [title.trim(), author.trim(), price, pages, parsedId]);

    res.status(200).json({ message: "Book Updated Successfully" });
  } catch (error) {
    next(error);
  }
});

// 5. DELETE /books/:id - Delete a book record by ID
app.delete(["/books/:id", "/books/:id/"], async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const parsedId = Number(rawId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        message: "Invalid bookId format. Must be a positive integer",
      });
    }

    // Verify record exists before deleting
    const existingBook = await db.get("SELECT * FROM book WHERE id = ?;", [parsedId]);
    if (!existingBook) {
      return res.status(404).json({
        message: `Book with ID ${parsedId} not found`,
      });
    }

    const query = "DELETE FROM book WHERE id = ?;";
    await db.run(query, [parsedId]);

    res.status(200).json({ message: "Book Deleted Successfully" });
  } catch (error) {
    next(error);
  }
});

// ==============================================================================
// 404 CATCH-ALL ROUTE HANDLER
// ==============================================================================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ==============================================================================
// GLOBAL ERROR HANDLER
// ==============================================================================
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;

