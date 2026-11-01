-- schema.sql
-- Table schema and seed data for Lab 2: SQLite database and CRUD routes

DROP TABLE IF EXISTS book;

CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
);

-- Seed data: 10 sample books
INSERT INTO book (title, author, price, pages) VALUES
  ('The Alchemist', 'Paulo Coelho', 299, 208),
  ('Atomic Habits', 'James Clear', 499, 320),
  ('To Kill a Mockingbird', 'Harper Lee', 399, 281),
  ('1984', 'George Orwell', 250, 328),
  ('Clean Code', 'Robert C. Martin', 850, 464),
  ('The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 920, 352),
  ('JavaScript: The Good Parts', 'Douglas Crockford', 450, 176),
  ('You Don''t Know JS', 'Kyle Simpson', 550, 278),
  ('Deep Work', 'Cal Newport', 420, 304),
  ('Introduction to Algorithms', 'Thomas H. Cormen', 1200, 1312);
