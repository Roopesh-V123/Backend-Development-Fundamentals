// setupDb.js
// Database initialization and seeding script using sqlite & sqlite3
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbPath = path.join(__dirname, 'books.db');

async function setupDatabase() {
  try {
    console.log('Connecting to database at:', dbPath);
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('Creating table "book"...');
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
    const countResult = await db.get('SELECT COUNT(*) as count FROM book;');
    if (countResult.count === 0) {
      console.log('Seeding initial 10 sample books...');
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
      console.log('Database seeded successfully with 10 books.');
    } else {
      console.log(`Table "book" already contains ${countResult.count} records. Skipping seeding.`);
    }

    const books = await db.all('SELECT * FROM book;');
    console.log('Current books in database:');
    console.table(books);

    await db.close();
    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
