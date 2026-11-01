// server.js
// Express server with SQLite database for Lab 2: CRUD routes
const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'books.db');

let db = null;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Initialize SQLite database and start the Express server
async function initializeDBAndServer() {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Ensure the 'book' table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    // Pre-populate if empty
    const countResult = await db.get('SELECT COUNT(*) as count FROM book;');
    if (countResult.count === 0) {
      const sampleBooks = [
        ['The Alchemist', 'Paulo Coelho', 299, 208],
        ['Atomic Habits', 'James Clear', 499, 320],
        ['To Kill a Mockingbird', 'Harper Lee', 399, 281],
        ['1984', 'George Orwell', 250, 328],
        ['Clean Code', 'Robert C. Martin', 850, 464],
        ['The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 920, 352],
        ['JavaScript: The Good Parts', 'Douglas Crockford', 450, 176],
        ["You Don't Know JS", 'Kyle Simpson', 550, 278],
        ['Deep Work', 'Cal Newport', 420, 304],
        ['Introduction to Algorithms', 'Thomas H. Cormen', 1200, 1312]
      ];
      for (const [title, author, price, pages] of sampleBooks) {
        await db.run(
          'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
          [title, author, price, pages]
        );
      }
      console.log('Database initialized and seeded with 10 books.');
    }

    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    process.exit(1);
  }
}

// Start database and server
initializeDBAndServer();

// Root route - Welcome and API Directory
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Books CRUD API - Lab 2',
    author: 'Vankadari Roopesh',
    registrationNumber: '252U1R1249',
    section: 'Learning Group 7',
    endpoints: {
      getAllBooks: 'GET /books/',
      getSingleBook: 'GET /books/:bookId/',
      addBook: 'POST /books/',
      updateBook: 'PUT /books/:bookId/',
      deleteBook: 'DELETE /books/:bookId/'
    }
  });
});

// 1. GET /books/ - Retrieve all books
app.get(['/books', '/books/'], async (req, res) => {
  try {
    const getBooksQuery = `
      SELECT
        id,
        title,
        author,
        price,
        pages
      FROM
        book
      ORDER BY
        id ASC;
    `;
    const books = await db.all(getBooksQuery);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// 2. GET /books/:bookId/ - Retrieve a single book by ID
app.get(['/books/:bookId', '/books/:bookId/'], async (req, res) => {
  try {
    const { bookId } = req.params;
    const getBookQuery = `
      SELECT
        id,
        title,
        author,
        price,
        pages
      FROM
        book
      WHERE
        id = ?;
    `;
    const book = await db.get(getBookQuery, [bookId]);

    if (!book) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Book with id ${bookId} was not found.`
      });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// 3. POST /books/ - Add a new book
app.post(['/books', '/books/'], async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    if (!title || !author || price === undefined || pages === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'All fields (title, author, price, pages) are required.'
      });
    }

    const addBookQuery = `
      INSERT INTO
        book (title, author, price, pages)
      VALUES
        (?, ?, ?, ?);
    `;
    const dbResponse = await db.run(addBookQuery, [title, author, price, pages]);

    res.status(201).json({
      message: 'Book Added Successfully',
      bookId: dbResponse.lastID
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// 4. PUT /books/:bookId/ - Update an existing book by ID
app.put(['/books/:bookId', '/books/:bookId/'], async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;

    // Check if the book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Book with id ${bookId} was not found.`
      });
    }

    const updatedTitle = title !== undefined ? title : existingBook.title;
    const updatedAuthor = author !== undefined ? author : existingBook.author;
    const updatedPrice = price !== undefined ? price : existingBook.price;
    const updatedPages = pages !== undefined ? pages : existingBook.pages;

    const updateBookQuery = `
      UPDATE
        book
      SET
        title = ?,
        author = ?,
        price = ?,
        pages = ?
      WHERE
        id = ?;
    `;
    await db.run(updateBookQuery, [
      updatedTitle,
      updatedAuthor,
      updatedPrice,
      updatedPages,
      bookId
    ]);

    res.status(200).json({
      message: 'Book Updated Successfully',
      bookId: Number(bookId)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// 5. DELETE /books/:bookId/ - Remove a book by ID
app.delete(['/books/:bookId', '/books/:bookId/'], async (req, res) => {
  try {
    const { bookId } = req.params;

    // Check if the book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Book with id ${bookId} was not found.`
      });
    }

    const deleteBookQuery = `
      DELETE FROM
        book
      WHERE
        id = ?;
    `;
    await db.run(deleteBookQuery, [bookId]);

    res.status(200).json({
      message: 'Book Deleted Successfully',
      bookId: Number(bookId)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Catch-all 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: '404 Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});
