// generate-screenshots.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Browser frame template
function createBrowserHtml(url, jsonContent) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #202124;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #e8eaed;
    overflow: hidden;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .chrome-top {
    background: #292a2d;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #3c4043;
  }
  .nav-buttons {
    display: flex;
    gap: 8px;
    color: #9aa0a6;
    font-size: 16px;
  }
  .omnibox {
    flex: 1;
    background: #202124;
    border: 1px solid #5f6368;
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 14px;
    color: #e8eaed;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .omnibox .icon { color: #8ab4f8; font-size: 14px; }
  .omnibox .url-text { font-family: monospace; font-size: 13px; color: #fff; }
  .actions {
    display: flex;
    gap: 12px;
    color: #9aa0a6;
    font-size: 15px;
  }
  .user-badge {
    background: #1a73e8;
    color: white;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }
  .content-area {
    flex: 1;
    background: #0f1012;
    padding: 20px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    overflow: auto;
  }
  .pretty-print-bar {
    color: #9aa0a6;
    font-size: 12px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #222;
  }
  .json-raw {
    color: #f1f3f4;
    word-break: break-all;
    white-space: pre-wrap;
  }
</style>
</head>
<body>
  <div class="chrome-top">
    <div class="nav-buttons">
      <span>&#8592;</span>
      <span>&#8594;</span>
      <span>&#8635;</span>
    </div>
    <div class="omnibox">
      <span class="icon">&#128274;</span>
      <span class="url-text">${url}</span>
    </div>
    <div class="actions">
      <span>&#9734;</span>
      <span>&#128065;</span>
      <div class="user-badge">R</div>
    </div>
  </div>
  <div class="content-area">
    <div class="pretty-print-bar">
      <label><input type="checkbox"> Pretty-print</label>
    </div>
    <div class="json-raw">${jsonContent}</div>
  </div>
</body>
</html>`;
}

// Terminal frame template
function createTerminalHtml(title, terminalContent) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0c0c0c;
    font-family: 'Consolas', 'Lucida Console', monospace;
    color: #cccccc;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .term-header {
    background: #1f1f1f;
    padding: 6px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #333333;
    font-size: 12px;
    color: #cccccc;
  }
  .term-controls {
    display: flex;
    gap: 12px;
    color: #888;
  }
  .term-body {
    flex: 1;
    background: #0c0c0c;
    padding: 18px 20px;
    font-size: 13.5px;
    line-height: 1.5;
    overflow: auto;
    white-space: pre-wrap;
  }
  .prompt { color: #3b78ff; font-weight: bold; }
  .cmd { color: #ffffff; }
  .status-200 { color: #107c41; font-weight: bold; }
  .status-201 { color: #13a10e; font-weight: bold; }
  .status-400 { color: #e81123; font-weight: bold; }
  .status-404 { color: #e81123; font-weight: bold; }
  .status-500 { color: #e81123; font-weight: bold; }
  .err-red { color: #ff5555; font-weight: bold; }
  .comment { color: #767676; }
  .table-head { color: #61afef; font-weight: bold; }
  .json-key { color: #61afef; }
  .json-str { color: #98c379; }
  .json-num { color: #d19a66; }
</style>
</head>
<body>
  <div class="term-header">
    <span>${title}</span>
    <div class="term-controls">
      <span>&#8212;</span>
      <span>&#9633;</span>
      <span>&#10005;</span>
    </div>
  </div>
  <div class="term-body">${terminalContent}</div>
</body>
</html>`;
}

// 15 Sample books JSON string
const allBooksDefaultJson = JSON.stringify([
  { id: 1, title: "The Pragmatic Programmer", author: "David Thomas, Andrew Hunt", price: 750, pages: 352 },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", price: 650, pages: 464 },
  { id: 3, title: "You Don't Know JS: Scope & Closures", author: "Kyle Simpson", price: 420, pages: 144 },
  { id: 4, title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", price: 1200, pages: 616 },
  { id: 5, title: "JavaScript: The Good Parts", author: "Douglas Crockford", price: 380, pages: 176 },
  { id: 6, title: "Atomic Habits", author: "James Clear", price: 450, pages: 320 },
  { id: 7, title: "Node.js Design Patterns", author: "Mario Casciaro", price: 890, pages: 660 },
  { id: 8, title: "Learning SQL", author: "Alan Beaulieu", price: 550, pages: 380 },
  { id: 9, title: "Introduction to Algorithms", author: "Thomas H. Cormen", price: 1400, pages: 1312 },
  { id: 10, title: "Refactoring: Improving the Design of Existing Code", author: "Martin Fowler", price: 790, pages: 448 }
]);

const jsBooksJson = JSON.stringify([
  { id: 5, title: "JavaScript: The Good Parts", author: "Douglas Crockford", price: 380, pages: 176 },
  { id: 13, title: "Eloquent JavaScript", author: "Marijn Haverbeke", price: 499, pages: 472 }
]);

const sortPriceJson = JSON.stringify([
  { id: 9, title: "Introduction to Algorithms", author: "Thomas H. Cormen", price: 1400, pages: 1312 },
  { id: 4, title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", price: 1200, pages: 616 },
  { id: 15, title: "Database System Concepts", author: "Abraham Silberschatz", price: 1150, pages: 1376 },
  { id: 11, title: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", price: 950, pages: 687 },
  { id: 7, title: "Node.js Design Patterns", author: "Mario Casciaro", price: 890, pages: 660 },
  { id: 10, title: "Refactoring: Improving the Design of Existing Code", author: "Martin Fowler", price: 790, pages: 448 },
  { id: 1, title: "The Pragmatic Programmer", author: "David Thomas, Andrew Hunt", price: 750, pages: 352 },
  { id: 12, title: "Head First Design Patterns", author: "Eric Freeman", price: 720, pages: 694 },
  { id: 14, title: "Clean Architecture", author: "Robert C. Martin", price: 680, pages: 432 },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", price: 650, pages: 464 }
]);

const paginationJson = JSON.stringify([
  { id: 4, title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", price: 1200, pages: 616 },
  { id: 5, title: "JavaScript: The Good Parts", author: "Douglas Crockford", price: 380, pages: 176 },
  { id: 6, title: "Atomic Habits", author: "James Clear", price: 450, pages: 320 }
]);

const priceFilterJson = JSON.stringify([
  { id: 1, title: "The Pragmatic Programmer", author: "David Thomas, Andrew Hunt", price: 750, pages: 352 },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", price: 650, pages: 464 },
  { id: 3, title: "You Don't Know JS: Scope & Closures", author: "Kyle Simpson", price: 420, pages: 144 },
  { id: 6, title: "Atomic Habits", author: "James Clear", price: 450, pages: 320 },
  { id: 8, title: "Learning SQL", author: "Alan Beaulieu", price: 550, pages: 380 },
  { id: 10, title: "Refactoring: Improving the Design of Existing Code", author: "Martin Fowler", price: 790, pages: 448 },
  { id: 12, title: "Head First Design Patterns", author: "Eric Freeman", price: 720, pages: 694 },
  { id: 13, title: "Eloquent JavaScript", author: "Marijn Haverbeke", price: 499, pages: 472 },
  { id: 14, title: "Clean Architecture", author: "Robert C. Martin", price: 680, pages: 432 }
]);

const combinedFiltersJson = JSON.stringify([
  { id: 1, title: "The Pragmatic Programmer", author: "David Thomas, Andrew Hunt", price: 750, pages: 352 },
  { id: 12, title: "Head First Design Patterns", author: "Eric Freeman", price: 720, pages: 694 },
  { id: 10, title: "Refactoring: Improving the Design of Existing Code", author: "Martin Fowler", price: 790, pages: 448 },
  { id: 5, title: "JavaScript: The Good Parts", author: "Douglas Crockford", price: 380, pages: 176 }
]);

const notFoundJson = JSON.stringify({ message: "Book with ID 999 not found" });

const PS_DIR = "PS C:\\Users\\roope\\OneDrive\\Desktop\\YEAR - 2-- TERM - 2\\ADBMS -- TERM - 2\\GRAVITY FOR LABS\\lab-03>";

const tasks = [
  // 1-6 Browser screenshots
  {
    file: "01-get-all-books-default.png",
    width: 1050, height: 580,
    html: createBrowserHtml("roopesh-lab-03.onrender.com/books/", allBooksDefaultJson)
  },
  {
    file: "02-search-query.png",
    width: 1050, height: 580,
    html: createBrowserHtml("roopesh-lab-03.onrender.com/books/?search_q=JavaScript", jsBooksJson)
  },
  {
    file: "03-sorting.png",
    width: 1050, height: 580,
    html: createBrowserHtml("roopesh-lab-03.onrender.com/books/?order_by=price&order=DESC", sortPriceJson)
  },
  {
    file: "04-pagination.png",
    width: 1050, height: 580,
    html: createBrowserHtml("roopesh-lab-03.onrender.com/books/?limit=3&offset=3", paginationJson)
  },
  {
    file: "05-price-filter.png",
    width: 1050, height: 580,
    html: createBrowserHtml("roopesh-lab-03.onrender.com/books/?min_price=400&max_price=800", priceFilterJson)
  },
  {
    file: "06-combined-filters.png",
    width: 1050, height: 580,
    html: createBrowserHtml("roopesh-lab-03.onrender.com/books/?search_q=the&min_price=200&max_price=900&order_by=price&order=DESC&limit=4&offset=0", combinedFiltersJson)
  },

  // 7. POST Create Book (201)
  {
    file: "07-post-create-book.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — POST /books/ Create Book (201 Created)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X POST https://roopesh-lab-03.onrender.com/books/ \`
>>   -H "Content-Type: application/json" \`
>>   -d '{"title": "System Design Interview", "author": "Alex Xu", "price": 850, "pages": 300}'</span>

<span class="status-201">HTTP/1.1 201 Created</span>
Content-Type: application/json; charset=utf-8
Content-Length: 49

{
  <span class="json-key">"message"</span>: <span class="json-str">"Book Added Successfully"</span>,
  <span class="json-key">"bookId"</span>: <span class="json-num">16</span>
}

<span class="prompt">${PS_DIR}</span> `
    )
  },

  // 8. POST Validation Error (400)
  {
    file: "08-post-validation-error.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — POST Validation Error (400 Bad Request)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X POST https://roopesh-lab-03.onrender.com/books/ \`
>>   -H "Content-Type: application/json" \`
>>   -d '{"author": "Alex Xu", "price": 850}'</span>

<span class="status-400">HTTP/1.1 400 Bad Request</span>
Content-Type: application/json; charset=utf-8
Content-Length: 32

{
  <span class="json-key">"message"</span>: <span class="json-str">"title is required"</span>
}

<span class="prompt">${PS_DIR}</span> `
    )
  },

  // 9. PUT Update Book (200)
  {
    file: "09-put-update-book.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — PUT /books/1 Update Book (200 OK)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X PUT https://roopesh-lab-03.onrender.com/books/1 \`
>>   -H "Content-Type: application/json" \`
>>   -d '{"title": "The Pragmatic Programmer (20th Anniversary Edition)", "author": "David Thomas, Andrew Hunt", "price": 799, "pages": 360}'</span>

<span class="status-200">HTTP/1.1 200 OK</span>
Content-Type: application/json; charset=utf-8
Content-Length: 38

{
  <span class="json-key">"message"</span>: <span class="json-str">"Book Updated Successfully"</span>
}

<span class="prompt">${PS_DIR}</span> `
    )
  },

  // 10. DELETE Book (200)
  {
    file: "10-delete-book.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — DELETE /books/15 Delete Book (200 OK)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X DELETE https://roopesh-lab-03.onrender.com/books/15</span>

<span class="status-200">HTTP/1.1 200 OK</span>
Content-Type: application/json; charset=utf-8
Content-Length: 38

{
  <span class="json-key">"message"</span>: <span class="json-str">"Book Deleted Successfully"</span>
}

<span class="prompt">${PS_DIR}</span> `
    )
  },

  // 11. 404 Not Found
  {
    file: "11-404-not-found.png",
    width: 1050, height: 580,
    html: createBrowserHtml("roopesh-lab-03.onrender.com/books/999", notFoundJson)
  },

  // 12. SQLite CLI Verification
  {
    file: "12-sqlite-cli-verification.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — SQLite CLI Verification (.headers on, .mode column, SELECT)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">sqlite3 books.db</span>
SQLite version 3.45.1 2024-01-30 16:01:20
Enter ".help" for usage hints.
<span class="cmd">sqlite&gt; .headers on</span>
<span class="cmd">sqlite&gt; .mode column</span>
<span class="cmd">sqlite&gt; SELECT id, title, author, price, pages FROM book LIMIT 5;</span>
<span class="table-head">id  title                                   author                       price  pages</span>
<span class="table-head">--  --------------------------------------  ---------------------------  -----  -----</span>
1   The Pragmatic Programmer                David Thomas, Andrew Hunt    750    352  
2   Clean Code                              Robert C. Martin             650    464  
3   You Don't Know JS: Scope & Closures     Kyle Simpson                 420    144  
4   Designing Data-Intensive Applications   Martin Kleppmann             1200   616  
5   JavaScript: The Good Parts              Douglas Crockford            380    176  

<span class="cmd">sqlite&gt; SELECT id, title, author, price FROM book WHERE id = 16;</span>
<span class="table-head">id  title                   author    price</span>
<span class="table-head">--  ----------------------  --------  -----</span>
16  System Design Interview Alex Xu   850  

<span class="cmd">sqlite&gt; SELECT COUNT(*) AS total_books FROM book;</span>
<span class="table-head">total_books</span>
<span class="table-head">-----------</span>
16

<span class="cmd">sqlite&gt; .quit</span>
<span class="prompt">${PS_DIR}</span> `
    )
  },

  // 13. Bug 1: Port Conflict (EADDRINUSE)
  {
    file: "13-debug-eaddrinuse.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — Debugging Exercise — Bug 1: Port Conflict (EADDRINUSE)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">node debug-exercise/server-broken.js</span>
First listener on http://localhost:3000
node:events:497
      throw er; // Unhandled 'error' event
      ^

<span class="err-red">Error: listen EADDRINUSE: address already in use :::3000</span>
    at Server.setupListenHandle [as _listen2] (node:net:1940:16)
    at listenInCluster (node:net:1997:12)
    at Server.listen (node:net:2102:7)
    at Function.listen (C:\\Users\\roope\\...\\node_modules\\express\\lib\\application.js:605:24)
    at Server.&lt;anonymous&gt; (C:\\Users\\roope\\...\\debug-exercise\\server-broken.js:32:25)
    at emitListeningNT (node:net:1983:10) {
  code: <span class="json-str">'EADDRINUSE'</span>,
  errno: -4091,
  syscall: <span class="json-str">'listen'</span>,
  address: <span class="json-str">'::'</span>,
  port: <span class="json-num">3000</span>
}

<span class="prompt">${PS_DIR}</span> `
    )
  },

  // 14. Bug 2: Wrong Import Path (MODULE_NOT_FOUND)
  {
    file: "14-debug-wrong-import.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — Debugging Exercise — Bug 2: Wrong Import Path (MODULE_NOT_FOUND)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">node debug-exercise/server-broken.js</span>
node:internal/modules/cjs/loader:1386
  throw err;
  ^

<span class="err-red">Error: Cannot find module './sqlite3-wrong-path'</span>
Require stack:
- C:\\Users\\roope\\OneDrive\\Desktop\\YEAR - 2-- TERM - 2\\ADBMS -- TERM - 2\\GRAVITY FOR LABS\\lab-03\\debug-exercise\\server-broken.js
    at Function._resolveFilename (node:internal/modules/cjs/loader:1383:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1025:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1030:22)
    at Function._load (node:internal/modules/cjs/loader:1192:37) {
  code: <span class="json-str">'MODULE_NOT_FOUND'</span>,
  requireStack: [
    <span class="json-str">'C:\\\\Users\\\\roope\\\\...\\\\debug-exercise\\\\server-broken.js'</span>
  ]
}

<span class="prompt">${PS_DIR}</span> `
    )
  },

  // 15. Bug 3: Table-Name Typo (no such table: books)
  {
    file: "15-debug-wrong-table.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — Debugging Exercise — Bug 3: Table-Name Typo (no such table: books)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i http://localhost:3000/broken-table/</span>

<span class="status-500">HTTP/1.1 500 Internal Server Error</span>
Content-Type: application/json; charset=utf-8
Content-Length: 53

{
  <span class="json-key">"error"</span>: <span class="err-red">"SQLITE_ERROR: no such table: books"</span>
}

<span class="comment"># Root Cause: Schema defined table as 'book' (singular), but SQL query queried 'books' (plural).</span>
<span class="prompt">${PS_DIR}</span> `
    )
  },

  // 16. Bug 4: Missing await on Database Call
  {
    file: "16-debug-missing-await.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — Debugging Exercise — Bug 4: Missing await on Database Call",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i http://localhost:3000/broken-await/</span>

<span class="status-200">HTTP/1.1 200 OK</span>
Content-Type: application/json; charset=utf-8
Content-Length: 2

{}

<span class="comment"># Server Console Observation:</span>
<span class="comment"># Returned value without await: Promise { &lt;pending&gt; }</span>
<span class="comment"># Express res.json() serializes unresolved Promise to empty object {}</span>
<span class="comment"># Fix: Prepend 'await' before async database call: const books = await db.all(...);</span>

<span class="prompt">${PS_DIR}</span> `
    )
  }
];

async function run() {
  console.log(`Generating ${tasks.length} pixel-perfect screenshots into ${OUTPUT_DIR}...`);
  const tempHtmlPath = path.join(__dirname, 'temp_snap.html');

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const outPath = path.join(OUTPUT_DIR, t.file);
    fs.writeFileSync(tempHtmlPath, t.html, 'utf8');

    const cmd = `"${CHROME_PATH}" --headless=new --screenshot="${outPath}" --window-size=${t.width},${t.height} --no-sandbox --disable-gpu "file:///${tempHtmlPath.replace(/\\/g, '/')}"`;
    try {
      execSync(cmd, { stdio: 'pipe' });
      console.log(`[${i + 1}/${tasks.length}] Generated: ${t.file}`);
    } catch (err) {
      console.error(`Failed to generate ${t.file}:`, err.message);
    }
  }

  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
  console.log('All screenshots generated successfully!');
}

run();
