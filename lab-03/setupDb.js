// setupDb.js
// Database initialization and seeding script using sqlite & sqlite3
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "books.db");

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

async function setupDatabase() {
  try {
    console.log("Connecting to database at:", dbPath);
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    console.log('Ensuring table "book" exists...');
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    // Check existing count
    const countResult = await db.get("SELECT COUNT(*) as count FROM book;");
    if (countResult.count < 15) {
      console.log("Seeding realistic sample books into 'book' table...");
      await db.exec("DELETE FROM book;");
      await db.exec("DELETE FROM sqlite_sequence WHERE name='book';");

      const insertStmt = await db.prepare(
        "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);"
      );

      for (const book of sampleBooks) {
        await insertStmt.run(book.title, book.author, book.price, book.pages);
      }
      await insertStmt.finalize();

      console.log(`Database successfully seeded with ${sampleBooks.length} books.`);
    } else {
      console.log(`Table "book" already contains ${countResult.count} records. Skipping seeding.`);
    }

    const books = await db.all("SELECT * FROM book;");
    console.log("Current books in database:");
    console.table(books);

    await db.close();
    console.log("Database setup complete.");
  } catch (error) {
    console.error("Error setting up database:", error.message);
    process.exit(1);
  }
}

setupDatabase();

