// setupDb.js
// Database initialization and seeding script using sqlite & sqlite3
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

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
  { title: "Head First Design Patterns", Eric: "Freeman", price: 720, pages: 694 },
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

    console.log("Creating tables 'book' and 'user'...");
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // Check books count
    const bookCount = await db.get("SELECT COUNT(*) as count FROM book;");
    if (bookCount.count < 15) {
      console.log("Seeding realistic sample books into 'book' table...");
      await db.exec("DELETE FROM book;");
      await db.exec("DELETE FROM sqlite_sequence WHERE name='book';");

      const insertStmt = await db.prepare(
        "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);"
      );
      for (const book of sampleBooks) {
        await insertStmt.run(book.title, book.author || "Eric Freeman", book.price, book.pages);
      }
      await insertStmt.finalize();
      console.log(`Database seeded with ${sampleBooks.length} books.`);
    }

    // Check users count
    const userCount = await db.get("SELECT COUNT(*) as count FROM user;");
    if (userCount.count === 0) {
      console.log("Seeding sample users with bcrypt hashed passwords...");
      const saltRounds = 10;
      const hash1 = await bcrypt.hash("secret123", saltRounds);
      const hash2 = await bcrypt.hash("secret123", saltRounds);

      const userStmt = await db.prepare(
        "INSERT INTO user (username, name, password) VALUES (?, ?, ?);"
      );
      await userStmt.run("roopesh", "Vankadari Roopesh", hash1);
      await userStmt.run("rahul", "Rahul Sharma", hash2);
      await userStmt.finalize();
      console.log("Users seeded successfully.");
    }

    const users = await db.all("SELECT id, username, name, password FROM user;");
    console.log("Current users in database (passwords strictly hashed):");
    console.table(users);

    await db.close();
    console.log("Database setup complete.");
  } catch (error) {
    console.error("Error setting up database:", error.message);
    process.exit(1);
  }
}

setupDatabase();
