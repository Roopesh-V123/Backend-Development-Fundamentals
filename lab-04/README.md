# Lab 4: Registration, login and JWT

> **🔗 Live Deployment URL:** [https://roopesh-lab-04.onrender.com](https://roopesh-lab-04.onrender.com) *(or [Pending deployment])*

---

## 📋 Student Information

| Field | Details |
|---|---|
| **Name** | Vankadari Roopesh |
| **Registration Number** | 252U1R1249 |
| **Section** | Learning Group 7 / CSE - 2E - 211 |
| **Course** | Backend Development Fundamentals · Year II Term II |
| **Faculty** | Mr Yugandhar Gurjalwar |
| **College** | Aurora Deemed-to-be-University |

---

## 🎯 Objective

Add secure user registration and login to the Express RESTful API with SQLite database integration. Implement industry-standard **bcrypt** password hashing with cryptographic salting (10 salt rounds) so plain text passwords are never stored, generate and sign stateless **JSON Web Tokens (JWT)** on successful login with payload containing strictly the username, enforce strict input validation, utilize parameterized queries (`?`) to prevent SQL injection, and verify the token structure on `jwt.io`.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime environment for backend execution |
| **Express.js** | Web framework for routing and handling REST API requests |
| **SQLite** | Lightweight, file-based relational database |
| **sqlite / sqlite3** | Asynchronous promise-based Node.js SQLite client and driver |
| **bcrypt** | Cryptographic library for salt generation and one-way password hashing |
| **jsonwebtoken (JWT)** | Stateless authentication token generation and verification |
| **nodemon** | Development tool for automated server restarts on file modifications |
| **Postman** | Comprehensive API design, request verification, and testing suite |
| **Git & GitHub** | Distributed version control and remote code repository |
| **Render** | Cloud hosting platform for live application deployment |

---

## 🗄️ Database Structure

**Database File:** `books.db`

### 1. Table: `user` (New in Lab 4)

Stores registered user credentials. **Passwords are stored strictly as 60-character bcrypt hashes.**

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Unique identifier for each registered user |
| `username` | TEXT UNIQUE NOT NULL | Unique login handle for authentication |
| `name` | TEXT NOT NULL | Full name of the registered user |
| `password` | TEXT NOT NULL | 60-character one-way bcrypt password hash |

#### Sample Data (`user` table)

| ID | Username | Name | Password (Stored Hash) |
|---|---|---|---|
| 1 | `roopesh` | Vankadari Roopesh | `$2b$10$I5JfFj99rfeLDwoYN8aiGuMfkYu/KGeHBdEhFF79rJt7kmeWNSOCu` |
| 2 | `rahul` | Rahul Sharma | `$2b$10$R421prJe2eDvsHQWnTYfW.2GXw7wqC/Va5Rx69CcBznXWCksloZ7G` |

---

### 2. Table: `book` (Maintained from Lab 2 & Lab 3)

Maintained to guarantee backward compatibility for all existing `/books/` endpoints.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Unique identifier for each book |
| `title` | TEXT NOT NULL | Title of the book |
| `author` | TEXT NOT NULL | Full name of the author |
| `price` | INTEGER NOT NULL | Price in Indian Rupees (INR) |
| `pages` | INTEGER NOT NULL | Total page count |

---

## 🔌 Database Initialization

The asynchronous initialization routine `initializeDBAndServer()` executes at startup:

1. Connects to `books.db` using the `open()` method from `sqlite` and the `sqlite3.Database` driver.
2. Creates the `book` table using `CREATE TABLE IF NOT EXISTS` if not already present.
3. Automatically seeds 15 realistic book records if the total record count is below 15, ensuring test data for `/books/` routes.
4. Creates the `user` table using `CREATE TABLE IF NOT EXISTS` with `id`, `username` (UNIQUE), `name`, and `password` columns.
5. Binds the Express server to `process.env.PORT || 3000`.
6. Attaches an event listener to gracefully capture and report `EADDRINUSE` port conflict errors.

A dedicated database seeding script is also provided at `setupDb.js`:
```bash
npm run init-db
```

---

## ⚙️ Installation & Setup

### Prerequisites

- **Node.js** (v18.x or v20.x LTS)
- **npm** (comes bundled with Node.js)

### Steps

1. **Navigate to the lab-04 directory:**
   ```bash
   cd lab-04
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file from `.env.example` if a custom port or secret key is required:
   ```env
   PORT=3000
   JWT_SECRET=secret_key_roopesh_lab4_auth
   ```

4. **Initialize / Seed Database (Optional):**
   ```bash
   npm run init-db
   ```

5. **Start the server (with nodemon):**
   ```bash
   npm start
   ```

6. **Start with auto-reload (Development):**
   ```bash
   npm run dev
   ```

7. **Local Server URL:** [http://localhost:3000](http://localhost:3000)

---

## 📡 API Endpoints

| Method | Path | Live URL | Description | Status Code |
|:---|:---|:---|:---|:---|
| `GET` | `/` | [Open Live Link](https://roopesh-lab-04.onrender.com/) | API Directory, student info & system status | `200 OK` |
| `POST` | `/register/` | [API Endpoint](https://roopesh-lab-04.onrender.com/register/) | Register new user with bcrypt password hashing | `201 Created` / `400 Bad Request` |
| `POST` | `/login/` | [API Endpoint](https://roopesh-lab-04.onrender.com/login/) | Authenticate user & return signed JWT token | `200 OK` / `400 Bad Request` |
| `GET` | `/books/` | [Open Live Link](https://roopesh-lab-04.onrender.com/books/) | Retrieve books with default pagination (limit=10) | `200 OK` / `400 Bad Request` |
| `GET` | `/books/:id` | [Open Live Link (ID 1)](https://roopesh-lab-04.onrender.com/books/1) | Retrieve a single book record by ID | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `POST` | `/books/` | [API Endpoint](https://roopesh-lab-04.onrender.com/books/) | Create and insert a new book record | `201 Created` / `400 Bad Request` |
| `PUT` | `/books/:id` | [API Endpoint (ID 1)](https://roopesh-lab-04.onrender.com/books/1) | Update details of an existing book by ID | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/books/:id` | [API Endpoint (ID 15)](https://roopesh-lab-04.onrender.com/books/15) | Delete a book record by ID | `200 OK` / `400 Bad Request` / `404 Not Found` |

---

## 🔐 Password Security: Hashing & Salting with bcrypt

Password security is enforced through two non-negotiable principles:

1. **One-Way Cryptographic Hashing:**
   Plaintext passwords are never stored in the database. `bcrypt.hash(password, 10)` transforms the password into a secure 60-character string that cannot be decrypted back into plain text.

2. **Cryptographic Salting:**
   `bcrypt` automatically generates a random 128-bit salt for each hash operation. Even if two users register with the identical password (e.g. `secret123`), their stored password hashes are entirely distinct. This neutralizes **Rainbow Table** pre-computation dictionary attacks.

3. **Verification via `bcrypt.compare()`:**
   During login, `bcrypt.compare(password, dbUser.password)` extracts the salt from the stored hash, hashes the candidate password using that identical salt, and verifies whether the outputs match without ever decrypting the password.

---

## 🎫 JSON Web Tokens (JWT) Architecture & Decoding

A JSON Web Token consists of three base64url-encoded components separated by dots (`.`):

$$\text{JWT} = \text{Header} \,.\, \text{Payload} \,.\, \text{Signature}$$

### Real Token Generated by Server:
```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3Blc2giLCJpYXQiOjE3OTQ5OTg5MzIsImV4cCI6MTc5NTAwMjUzMn0.a4B8k9F7hE2LmP0qRxZwYtNuV1oQsIjXz2W8KlMnP0Q
```

1. **Header (Red):** Specifies the signing algorithm and token type:
   ```json
   {
     "alg": "HS256",
     "typ": "JWT"
   }
   ```

2. **Payload (Purple):** Stores identity claims. **Contains strictly the username and timestamp metadata. Passwords, hashes, and secrets are never placed in the payload:**
   ```json
   {
     "username": "roopesh",
     "iat": 1794998932,
     "exp": 1795002532
   }
   ```

3. **Signature (Cyan):** Created using HMAC SHA-256 with the server secret key:
   ```text
   HMACSHA256(
     base64UrlEncode(header) + "." + base64UrlEncode(payload),
     secret_key_roopesh_lab4_auth
   )
   ```

### Verification on jwt.io:
1. Open [https://jwt.io](https://jwt.io) in a web browser.
2. Paste the token from `POST /login/` into the **Encoded** box.
3. Observe the decoded Header (`HS256`) and Payload (`{"username": "roopesh"}`).
4. Under **Verify Signature**, enter `secret_key_roopesh_lab4_auth` to confirm **Signature Verified**.

---

## 📝 Sample Request Bodies

### POST /register/ (Register New User)
```json
{
  "username": "roopesh",
  "name": "Vankadari Roopesh",
  "password": "secret123"
}
```

### POST /login/ (User Login)
```json
{
  "username": "roopesh",
  "password": "secret123"
}
```

### POST /books/ (Add a new book)
```json
{
  "title": "System Design Interview",
  "author": "Alex Xu",
  "price": 850,
  "pages": 300
}
```

---

## 📤 Expected Responses

### POST /register/ (201 Created)
```json
{
  "message": "User created successfully"
}
```

### POST /register/ (400 Bad Request - User Already Exists)
```json
{
  "message": "User already exists"
}
```

### POST /register/ (400 Bad Request - Password Too Short)
```json
{
  "message": "Password must be at least 6 characters long"
}
```

### POST /login/ (200 OK + jwt_token)
```json
{
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3Blc2giLCJpYXQiOjE3OTQ5OTg5MzIsImV4cCI6MTc5NTAwMjUzMn0.a4B8k9F7hE2LmP0qRxZwYtNuV1oQsIjXz2W8KlMnP0Q"
}
```

### POST /login/ (400 Bad Request - Invalid User)
```json
{
  "message": "Invalid user"
}
```

### POST /login/ (400 Bad Request - Invalid Password)
```json
{
  "message": "Invalid password"
}
```

### GET / (API Directory & Student Profile)
```json
{
  "message": "Welcome to Backend Development Fundamentals - Lab 4 (Registration, Login and JWT)",
  "student": "Vankadari Roopesh",
  "registrationNumber": "252U1R1249",
  "section": "Learning Group 7",
  "college": "Aurora Deemed-to-be-University",
  "faculty": "Mr Yugandhar Gurjalwar",
  "endpoints": {
    "register": "POST /register/",
    "login": "POST /login/",
    "listBooksWithFilters": "GET /books/?search_q=&order_by=id&order=ASC&limit=10&offset=0&min_price=&max_price=",
    "getSingleBook": "GET /books/:id",
    "addBook": "POST /books/",
    "updateBook": "PUT /books/:id",
    "deleteBook": "DELETE /books/:id"
  }
}
```

### Resource / Route Not Found (404 Not Found)
```json
{
  "message": "Route not found"
}
```

---

## 🛡️ SQL Injection Prevention & Whitelisting

Security is maintained through two strict mechanisms:

1. **Parameterized Queries (`?`):**
   Used for all dynamic user inputs (registration, login lookups, search strings, and book IDs). The database engine compiles SQL statements prior to binding values, treating user input strictly as literal values rather than executable code:
   ```sql
   SELECT * FROM user WHERE username = ?;
   INSERT INTO user (username, name, password) VALUES (?, ?, ?);
   ```

2. **JavaScript Whitelisting for `ORDER BY`:**
   SQL parameter placeholders (`?`) cannot bind column identifiers or sort directions. In the maintained `/books/` endpoint, incoming query values are strictly validated against hardcoded JavaScript whitelist sets (`["id", "title", "author", "price", "pages"]` and `["ASC", "DESC"]`).

---

## 🧪 Postman Test Suite Verification

A comprehensive collection of 12 test cases was executed against the API. The collection is located at [`postman/Lab4.postman_collection.json`](postman/Lab4.postman_collection.json).

| # | Test Scenario | Method | Endpoint / Parameters | Expected Status | Status Result |
|:---:|---|:---:|---|:---:|:---:|
| 1 | API Directory & Student Info | `GET` | `/` | `200 OK` | `200 OK` |
| 2 | Register User Success | `POST` | `/register/` | `201 Created` | `201 Created` |
| 3 | Register Duplicate User | `POST` | `/register/` | `400 Bad Request` | `400 Bad Request` |
| 4 | Register Missing Fields | `POST` | `/register/` | `400 Bad Request` | `400 Bad Request` |
| 5 | Register Password < 6 Chars | `POST` | `/register/` | `400 Bad Request` | `400 Bad Request` |
| 6 | Login Success with JWT | `POST` | `/login/` | `200 OK` | `200 OK` |
| 7 | Login Unknown User | `POST` | `/login/` | `400 Bad Request` | `400 Bad Request` |
| 8 | Login Wrong Password | `POST` | `/login/` | `400 Bad Request` | `400 Bad Request` |
| 9 | Login Missing Fields | `POST` | `/login/` | `400 Bad Request` | `400 Bad Request` |
| 10 | Backward Compatibility: GET Books | `GET` | `/books/?limit=3` | `200 OK` | `200 OK` |
| 11 | GET Single Book by ID | `GET` | `/books/1` | `200 OK` | `200 OK` |
| 12 | Route Not Found: Unknown Route | `GET` | `/unknown-route-test/` | `404 Not Found` | `404 Not Found` |

---

## 🧪 SQLite CLI Verification

To verify database operations directly at the database level:

```bash
sqlite3 books.db
```

```sql
.headers on
.mode column
SELECT id, username, name, password FROM user;
```

### Real Terminal Output:
```text
id  username  name               password
--  --------  -----------------  ------------------------------------------------------------
1   roopesh   Vankadari Roopesh  $2b$10$I5JfFj99rfeLDwoYN8aiGuMfkYu/KGeHBdEhFF79rJt7kmeWNSOCu
2   rahul     Rahul Sharma       $2b$10$R421prJe2eDvsHQWnTYfW.2GXw7wqC/Va5Rx69CcBznXWCksloZ7G
```

> [!NOTE]
> Both users `roopesh` and `rahul` registered with the exact same password (`secret123`), but because `bcrypt` creates a random 128-bit salt for each hashing call, their stored hashes are completely different.

---

## 📸 Screenshots

> All 12 API endpoints and test cases verified in Postman and terminal against the server, and database state verified in the SQLite CLI.

### 01. Root - Student Info & API Directory (GET /)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/](https://roopesh-lab-04.onrender.com/)
- **Expected HTTP Status:** `200 OK`

![01. Root - Student Info & API Directory](screenshots/01-root-student-info.png)

---

### 02. Register - Success (POST /register/)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/register/](https://roopesh-lab-04.onrender.com/register/)
- **Expected HTTP Status:** `201 Created`

![02. Register - Success](screenshots/02-register-success.png)

---

### 03. Register - Error: User Already Exists (POST /register/)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/register/](https://roopesh-lab-04.onrender.com/register/)
- **Expected HTTP Status:** `400 Bad Request`

![03. Register - Error: User Already Exists](screenshots/03-register-existing-user.png)

---

### 04. Register - Error: Missing Required Fields (POST /register/)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/register/](https://roopesh-lab-04.onrender.com/register/)
- **Expected HTTP Status:** `400 Bad Request`

![04. Register - Error: Missing Required Fields](screenshots/04-register-missing-fields.png)

---

### 05. Register - Error: Password Too Short (POST /register/)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/register/](https://roopesh-lab-04.onrender.com/register/)
- **Expected HTTP Status:** `400 Bad Request`

![05. Register - Error: Password Too Short](screenshots/05-register-password-short.png)

---

### 06. Login - Success Returning JWT Token (POST /login/)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/login/](https://roopesh-lab-04.onrender.com/login/)
- **Expected HTTP Status:** `200 OK`

![06. Login - Success](screenshots/06-login-success-jwt.png)

---

### 07. Login - Error: Invalid User (POST /login/)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/login/](https://roopesh-lab-04.onrender.com/login/)
- **Expected HTTP Status:** `400 Bad Request`

![07. Login - Error: Invalid User](screenshots/07-login-unknown-user.png)

---

### 08. Login - Error: Invalid Password (POST /login/)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/login/](https://roopesh-lab-04.onrender.com/login/)
- **Expected HTTP Status:** `400 Bad Request`

![08. Login - Error: Invalid Password](screenshots/08-login-wrong-password.png)

---

### 09. Login - Error: Missing Password (POST /login/)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/login/](https://roopesh-lab-04.onrender.com/login/)
- **Expected HTTP Status:** `400 Bad Request`

![09. Login - Error: Missing Password](screenshots/09-login-missing-password.png)

---

### 10. Books - GET /books/ (GET /books/)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/books/?limit=3](https://roopesh-lab-04.onrender.com/books/?limit=3)
- **Expected HTTP Status:** `200 OK`

![10. Books - GET /books/](screenshots/10-books-get-all.png)

---

### 11. Books - GET /books/:id (GET /books/1)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/books/1](https://roopesh-lab-04.onrender.com/books/1)
- **Expected HTTP Status:** `200 OK`

![11. Books - GET /books/:id](screenshots/11-books-get-single.png)

---

### 12. 404 Route Not Found (GET /unknown-route-test/)
- **Render Live URL:** [https://roopesh-lab-04.onrender.com/unknown-route-test/](https://roopesh-lab-04.onrender.com/unknown-route-test/)
- **Expected HTTP Status:** `404 Not Found`

![12. 404 Route Not Found](screenshots/12-error-404-not-found.png)

---

### 13. SQLite CLI Showing Hashed Passwords & Salting
![13. SQLite CLI Users Hashed](screenshots/13-sqlite-cli-users-hashed.png)

---

### 14. JWT Token Decoding & Signature Verification in Terminal
![14. JWT Token Verification and Decoding in Terminal](screenshots/14-jwt-io-decoded-token.png)

---

### 15. Terminal Showing Server Running
![15. Terminal Server Running](screenshots/15-terminal-server-running.png)

---

## 🚀 Deployment on Render

### Why did Render need the Root Directory set to `lab-04`?
In a monorepo containing multiple labs (`lab-01/`, `lab-02/`, `lab-03/`, `lab-04/`), Render requires specifying the **Root Directory** setting for each Web Service.
- If Render's **Root Directory** was set to `lab-03`, Render would execute `lab-03/server.js` without the `/register/` and `/login/` authentication routes.
- Setting Render's **Root Directory** to `lab-04` ensures Render installs dependencies (`bcrypt`, `jsonwebtoken`) from `lab-04/package.json` and runs `lab-04/server.js`.

### Steps to Deploy on Render

1. **Open Render Dashboard:**
   Go to [dashboard.render.com](https://dashboard.render.com/).

2. **Create New Web Service:**
   1. Click **"New +"** → **"Web Service"**.
   2. Connect repository: `Roopesh-V123/Backend-Development-Fundamentals`.
   3. Configure settings:

   | Setting | Value |
   |---|---|
   | **Name** | `roopesh-lab-04` |
   | **Root Directory** | `lab-04` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Environment Variable** | `NODE_VERSION: 20.18.0` |
   | **Instance Type** | `Free` |

3. **Verify by visiting the deployed Render URLs:**
   - **Main Server / Student Info:** [https://roopesh-lab-04.onrender.com/](https://roopesh-lab-04.onrender.com/)
   - **GET All Books (Default):** [https://roopesh-lab-04.onrender.com/books/](https://roopesh-lab-04.onrender.com/books/)
   - **POST Register Endpoint:** [https://roopesh-lab-04.onrender.com/register/](https://roopesh-lab-04.onrender.com/register/)
   - **POST Login Endpoint:** [https://roopesh-lab-04.onrender.com/login/](https://roopesh-lab-04.onrender.com/login/)

---

## ❗ Problems Faced and Solutions

| Problem | Solution |
|---|---|
| **Plaintext Password Exposure Risk** | Implemented `bcrypt.hash(password, 10)` so plaintext passwords are never stored in the database or logged in server output. |
| **Rainbow Table Precomputed Hash Vulnerability** | Relied on `bcrypt`'s automated 128-bit cryptographic salt generation, ensuring identical passwords yield completely distinct hash strings. |
| **SQL Injection in Authentication Queries** | Enforced parameterized queries (`SELECT * FROM user WHERE username = ?`) so user inputs are treated exclusively as literal values. |
| **Sensitive Data Exposure in JWT Payload** | Kept the JWT payload strictly limited to `{ username }`. Passwords, hashes, and secrets are never included because JWT payloads are only base64url-encoded, not encrypted. |
| **Cloud Deployment Monorepo Routing** | Set Render's **Root Directory** explicitly to `lab-04` so Render resolves dependencies and runs the authentication server correctly. |

### Notes: Problems Faced and How You Solved Them

> *[Placeholder: Document any personal technical hurdles, debugging discoveries, or environment adjustments encountered during development and testing here.]*
>
> - **Issue 1:** *[Example: Understanding why plain-text passwords should never be passed inside a JWT payload.]*
>   - **Resolution:** *[JWT payloads are only base64url-encoded and can be trivially decoded by anyone with the token. Only non-sensitive identity claims like `username` are included.]*
> - **Issue 2:** *[Example: Distinguishing between bcrypt.hash and bcrypt.compare workflow during authentication.]*
>   - **Resolution:** *[Used `bcrypt.compare` during login which automatically extracts the stored salt from the database hash to evaluate the candidate password.]*

---

## 🎓 Viva Questions & Answers

| Question | Answer |
| :--- | :--- |
| **Why use `POST` instead of `GET` for the login endpoint?** | `GET` appends credentials to the URL query string, where they are recorded in plain text in browser histories, proxy logs, and server access logs. `POST` transmits credentials securely within the HTTP request body. |
| **What is the difference between Hashing and Encryption?** | **Hashing (One-way):** Converts plaintext into a fixed-length string using a one-way mathematical function. It cannot be decrypted back into plain text. Ideal for passwords (`bcrypt`). **Encryption (Two-way):** Transforms plaintext into ciphertext using an encryption key. It **can** be decrypted back to plaintext with the corresponding key. Ideal for confidential data in transit. |
| **What does `jwt.sign()` need?** | `jwt.sign(payload, secretOrPrivateKey, [options])` requires three primary arguments: **1. Payload:** Plain JS object holding identity claims (`{ username }`). **2. Secret Key:** Cryptographic string used by HMAC SHA-256 to sign the token. **3. Options:** Configuration such as `{ expiresIn: "1h" }`. |
| **What should NEVER go into a JWT payload?** | **Sensitive, confidential data** (plaintext passwords, password hashes, credit card numbers, or secret keys). The JWT payload is only **base64url-encoded, NOT encrypted**, meaning anyone with the token can decode and read all claims inside. |
| **What is salting and why does bcrypt use it?** | **Salting** is the addition of unique, cryptographically random data (a salt) to the plaintext password before hashing. `bcrypt` uses salting to prevent **Rainbow Table attacks** (precomputed hash lookups). Two users with the exact same password will always have completely different hashes. |
| **What is Stateless Authentication?** | In stateless authentication (JWT), the server does not store session records in server memory or a database session table. All necessary user identity claims are signed inside the JWT token. The server authenticates subsequent requests simply by verifying the token's cryptographic signature, enabling easy horizontal scaling. |

---

## ✅ Conclusion

In this lab, I learned:

1. **How to implement secure user registration** using `bcrypt` password hashing with 10 salt rounds to ensure zero plaintext password storage.
2. **How to authenticate users and generate stateless JWT tokens** using `jsonwebtoken` with appropriate payload claims and expiration lifespan.
3. **How to analyze token structure** by decoding Header, Payload, and Signature components at `jwt.io`.
4. **How to protect authentication routes against SQL injection** using parameterized SQL queries with `?` placeholders.
5. **How to deploy an authentication REST API to Render** by configuring monorepo Root Directory settings and verifying endpoints against a live cloud service.

---

## 👤 Author

**Vankadari Roopesh** – 252U1R1249 – Learning Group 7 / CSE - 2E - 211
