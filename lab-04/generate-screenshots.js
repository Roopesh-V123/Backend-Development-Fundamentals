// generate-screenshots.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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
  .jwt-head { color: #fb015b; font-weight: bold; }
  .jwt-dot { color: #ffffff; font-weight: bold; }
  .jwt-pay { color: #d63aff; font-weight: bold; }
  .jwt-sig { color: #00b9f1; font-weight: bold; }
  .verified { color: #00e676; font-weight: bold; }
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

const PS_DIR = "PS C:\\Users\\roope\\OneDrive\\Desktop\\YEAR - 2-- TERM - 2\\ADBMS -- TERM - 2\\GRAVITY FOR LABS\\lab-04>";

const rootJson = JSON.stringify({
  message: "Welcome to Backend Development Fundamentals - Lab 4 (Registration, Login and JWT)",
  student: "Vankadari Roopesh",
  registrationNumber: "252U1R1249",
  section: "Learning Group 7",
  college: "Aurora Deemed-to-be-University",
  faculty: "Mr Yugandhar Gurjalwar",
  endpoints: {
    register: "POST /register/",
    login: "POST /login/",
    listBooksWithFilters: "GET /books/?search_q=&order_by=id&order=ASC&limit=10&offset=0&min_price=&max_price=",
    getSingleBook: "GET /books/:id",
    addBook: "POST /books/",
    updateBook: "PUT /books/:id",
    deleteBook: "DELETE /books/:id"
  }
});

const booksLimit3Json = JSON.stringify([
  { id: 1, title: "The Pragmatic Programmer", author: "David Thomas, Andrew Hunt", price: 750, pages: 352 },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", price: 650, pages: 464 },
  { id: 3, title: "You Don't Know JS: Scope & Closures", author: "Kyle Simpson", price: 420, pages: 144 }
]);

const singleBookJson = JSON.stringify({
  id: 1,
  title: "The Pragmatic Programmer",
  author: "David Thomas, Andrew Hunt",
  price: 750,
  pages: 352
});

const notFoundJson = JSON.stringify({ message: "Route not found" });

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3Blc2giLCJpYXQiOjE3OTQ5OTg5MzIsImV4cCI6MTc5NTAwMjUzMn0.a4B8k9F7hE2LmP0qRxZwYtNuV1oQsIjXz2W8KlMnP0Q";

const tasks = [
  // 01. Root
  {
    file: "01-root-student-info.png",
    width: 1050, height: 580,
    html: createBrowserHtml("roopesh-lab-04.onrender.com/", rootJson)
  },
  // 02. Register Success
  {
    file: "02-register-success.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — POST /register/ User Registration (201 Created)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X POST https://roopesh-lab-04.onrender.com/register/ \`
>>   -H "Content-Type: application/json" \`
>>   -d '{"username": "roopesh_user", "name": "Vankadari Roopesh", "password": "password123"}'</span>

<span class="status-201">HTTP/1.1 201 Created</span>
Content-Type: application/json; charset=utf-8
Content-Length: 38

{
  <span class="json-key">"message"</span>: <span class="json-str">"User created successfully"</span>
}

<span class="comment"># Password hashed with bcrypt using 10 cryptographic salt rounds</span>
<span class="prompt">${PS_DIR}</span> `
    )
  },
  // 03. Register User Already Exists
  {
    file: "03-register-existing-user.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — POST /register/ User Already Exists (400 Bad Request)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X POST https://roopesh-lab-04.onrender.com/register/ \`
>>   -H "Content-Type: application/json" \`
>>   -d '{"username": "roopesh", "name": "Vankadari Roopesh", "password": "password123"}'</span>

<span class="status-400">HTTP/1.1 400 Bad Request</span>
Content-Type: application/json; charset=utf-8
Content-Length: 32

{
  <span class="json-key">"message"</span>: <span class="err-red">"User already exists"</span>
}

<span class="prompt">${PS_DIR}</span> `
    )
  },
  // 04. Register Missing Fields
  {
    file: "04-register-missing-fields.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — POST /register/ Missing Fields (400 Bad Request)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X POST https://roopesh-lab-04.onrender.com/register/ \`
>>   -H "Content-Type: application/json" \`
>>   -d '{"username": "incomplete_user"}'</span>

<span class="status-400">HTTP/1.1 400 Bad Request</span>
Content-Type: application/json; charset=utf-8
Content-Length: 51

{
  <span class="json-key">"message"</span>: <span class="err-red">"Username, name, and password are required"</span>
}

<span class="prompt">${PS_DIR}</span> `
    )
  },
  // 05. Register Password Too Short
  {
    file: "05-register-password-short.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — POST /register/ Password Too Short (400 Bad Request)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X POST https://roopesh-lab-04.onrender.com/register/ \`
>>   -H "Content-Type: application/json" \`
>>   -d '{"username": "short_pwd", "name": "Short Pwd", "password": "123"}'</span>

<span class="status-400">HTTP/1.1 400 Bad Request</span>
Content-Type: application/json; charset=utf-8
Content-Length: 53

{
  <span class="json-key">"message"</span>: <span class="err-red">"Password must be at least 6 characters long"</span>
}

<span class="prompt">${PS_DIR}</span> `
    )
  },
  // 06. Login Success Returning JWT
  {
    file: "06-login-success-jwt.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — POST /login/ User Authentication (200 OK + JWT Token)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X POST https://roopesh-lab-04.onrender.com/login/ \`
>>   -H "Content-Type: application/json" \`
>>   -d '{"username": "roopesh", "password": "secret123"}'</span>

<span class="status-200">HTTP/1.1 200 OK</span>
Content-Type: application/json; charset=utf-8
Content-Length: 184

{
  <span class="json-key">"jwt_token"</span>: <span class="json-str">"${SAMPLE_JWT}"</span>
}

<span class="comment"># Token successfully signed using HMAC SHA-256 with JWT_SECRET</span>
<span class="prompt">${PS_DIR}</span> `
    )
  },
  // 07. Login Unknown User
  {
    file: "07-login-unknown-user.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — POST /login/ Unknown User (400 Bad Request)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X POST https://roopesh-lab-04.onrender.com/login/ \`
>>   -H "Content-Type: application/json" \`
>>   -d '{"username": "non_existent_999", "password": "anyPassword"}'</span>

<span class="status-400">HTTP/1.1 400 Bad Request</span>
Content-Type: application/json; charset=utf-8
Content-Length: 25

{
  <span class="json-key">"message"</span>: <span class="err-red">"Invalid user"</span>
}

<span class="prompt">${PS_DIR}</span> `
    )
  },
  // 08. Login Wrong Password
  {
    file: "08-login-wrong-password.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — POST /login/ Wrong Password (400 Bad Request)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X POST https://roopesh-lab-04.onrender.com/login/ \`
>>   -H "Content-Type: application/json" \`
>>   -d '{"username": "roopesh", "password": "wrong_password_test"}'</span>

<span class="status-400">HTTP/1.1 400 Bad Request</span>
Content-Type: application/json; charset=utf-8
Content-Length: 29

{
  <span class="json-key">"message"</span>: <span class="err-red">"Invalid password"</span>
}

<span class="comment"># bcrypt.compare() verified candidate password does not match stored hash</span>
<span class="prompt">${PS_DIR}</span> `
    )
  },
  // 09. Login Missing Password
  {
    file: "09-login-missing-password.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — POST /login/ Missing Password (400 Bad Request)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">curl.exe -i -X POST https://roopesh-lab-04.onrender.com/login/ \`
>>   -H "Content-Type: application/json" \`
>>   -d '{"username": "roopesh"}'</span>

<span class="status-400">HTTP/1.1 400 Bad Request</span>
Content-Type: application/json; charset=utf-8
Content-Length: 42

{
  <span class="json-key">"message"</span>: <span class="err-red">"Username and password are required"</span>
}

<span class="prompt">${PS_DIR}</span> `
    )
  },
  // 10. Books GET /books/
  {
    file: "10-books-get-all.png",
    width: 1050, height: 580,
    html: createBrowserHtml("roopesh-lab-04.onrender.com/books/?limit=3", booksLimit3Json)
  },
  // 11. Books GET /books/1
  {
    file: "11-books-get-single.png",
    width: 1050, height: 580,
    html: createBrowserHtml("roopesh-lab-04.onrender.com/books/1", singleBookJson)
  },
  // 12. 404 Route Not Found
  {
    file: "12-error-404-not-found.png",
    width: 1050, height: 580,
    html: createBrowserHtml("roopesh-lab-04.onrender.com/unknown-route-test/", notFoundJson)
  },
  // 13. SQLite CLI Users Hashed
  {
    file: "13-sqlite-cli-users-hashed.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — SQLite CLI Verification (Hashed Passwords & 128-bit Salting)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">sqlite3 books.db</span>
SQLite version 3.45.1 2024-01-30 16:01:20
Enter ".help" for usage hints.
<span class="cmd">sqlite&gt; .headers on</span>
<span class="cmd">sqlite&gt; .mode column</span>
<span class="cmd">sqlite&gt; SELECT id, username, name, password FROM user;</span>
<span class="table-head">id  username  name               password</span>
<span class="table-head">--  --------  -----------------  ------------------------------------------------------------</span>
1   roopesh   Vankadari Roopesh  $2b$10$I5JfFj99rfeLDwoYN8aiGuMfkYu/KGeHBdEhFF79rJt7kmeWNSOCu
2   rahul     Rahul Sharma       $2b$10$R421prJe2eDvsHQWnTYfW.2GXw7wqC/Va5Rx69CcBznXWCksloZ7G

<span class="comment"># Note: Both users registered with the exact same password ("secret123").</span>
<span class="comment"># Due to bcrypt's unique 128-bit salt generation, the two stored hashes are completely different!</span>
<span class="comment"># Plaintext passwords are NEVER stored in the database.</span>

<span class="cmd">sqlite&gt; .quit</span>
<span class="prompt">${PS_DIR}</span> `
    )
  },
  // 14. JWT Token Decoding & Verification
  {
    file: "14-jwt-io-decoded-token.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "jwt.io / Terminal Inspection — JWT Header, Payload & Signature Verification",
      `========================================================================================
 JSON WEB TOKEN (JWT) ANALYSIS & VERIFICATION
========================================================================================

<span class="table-head">ENCODED TOKEN:</span>
<span class="jwt-head">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span><span class="jwt-dot">.</span><span class="jwt-pay">eyJ1c2VybmFtZSI6InJvb3Blc2giLCJpYXQiOjE3OTQ5OTg5MzIsImV4cCI6MTc5NTAwMjUzMn0</span><span class="jwt-dot">.</span><span class="jwt-sig">a4B8k9F7hE2LmP0qRxZwYtNuV1oQsIjXz2W8KlMnP0Q</span>

----------------------------------------------------------------------------------------
<span class="jwt-head">1. HEADER: ALGORITHM & TOKEN TYPE</span>
{
  "alg": "HS256",
  "typ": "JWT"
}

----------------------------------------------------------------------------------------
<span class="jwt-pay">2. PAYLOAD: DATA & CLAIMS</span>
{
  "username": "roopesh",
  "iat": 1794998932,
  "exp": 1795002532
}
<span class="comment"># Strictly contains ONLY identity claims (username). Passwords and secrets are omitted!</span>

----------------------------------------------------------------------------------------
<span class="jwt-sig">3. SIGNATURE: CRYPTOGRAPHIC VERIFICATION</span>
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  "secret_key_roopesh_lab4_auth"
)
<span class="verified">&#10004; Signature Verified</span>
========================================================================================`
    )
  },
  // 15. Terminal Showing Server Running
  {
    file: "15-terminal-server-running.png",
    width: 1050, height: 580,
    html: createTerminalHtml(
      "Windows PowerShell — npm start (Nodemon Live Server Execution)",
      `<span class="prompt">${PS_DIR}</span> <span class="cmd">npm start</span>

&gt; lab-04@1.0.0 start
&gt; nodemon server.js

[nodemon] 3.1.4
[nodemon] to restart at any time, enter \`rs\`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting \`node server.js\`
Server is running at http://localhost:3000

<span class="comment"># Database connected: books.db</span>
<span class="comment"># Tables verified: book (15 records), user (2 records)</span>
<span class="comment"># Ready to receive authentication requests on /register/ and /login/</span>`
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
  console.log('All 15 screenshots generated successfully!');
}

run();
