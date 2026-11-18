// test-api.js
// Automated verification test runner for Lab 4 Registration, Login and JWT API
const jwt = require("jsonwebtoken");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const testScenarios = [
  { id: 1, name: "Root - API Directory & Student Info", method: "GET", path: "/", expectedStatus: 200 },
  {
    id: 2,
    name: "Register - Success",
    method: "POST",
    path: "/register/",
    expectedStatus: 201,
    body: { username: "vankadari_test", name: "Roopesh Tester", password: "password123" }
  },
  {
    id: 3,
    name: "Register - Error: User Already Exists",
    method: "POST",
    path: "/register/",
    expectedStatus: 400,
    body: { username: "roopesh", name: "Vankadari Roopesh", password: "password123" }
  },
  {
    id: 4,
    name: "Register - Error: Missing Fields",
    method: "POST",
    path: "/register/",
    expectedStatus: 400,
    body: { username: "incomplete_user" }
  },
  {
    id: 5,
    name: "Register - Error: Password Too Short (< 6 chars)",
    method: "POST",
    path: "/register/",
    expectedStatus: 400,
    body: { username: "short_pwd", name: "Short Pwd", password: "123" }
  },
  {
    id: 6,
    name: "Login - Success with JWT Token",
    method: "POST",
    path: "/login/",
    expectedStatus: 200,
    body: { username: "roopesh", password: "secret123" },
    checkToken: true
  },
  {
    id: 7,
    name: "Login - Error: Invalid User",
    method: "POST",
    path: "/login/",
    expectedStatus: 400,
    body: { username: "non_existent_user_999", password: "anyPassword" }
  },
  {
    id: 8,
    name: "Login - Error: Invalid Password",
    method: "POST",
    path: "/login/",
    expectedStatus: 400,
    body: { username: "roopesh", password: "wrong_password_here" }
  },
  {
    id: 9,
    name: "Login - Error: Missing Password",
    method: "POST",
    path: "/login/",
    expectedStatus: 400,
    body: { username: "roopesh" }
  },
  { id: 10, name: "Books - GET /books/ (Backward Compatibility)", method: "GET", path: "/books/?limit=3", expectedStatus: 200 },
  { id: 11, name: "Books - GET /books/1 (Single Record)", method: "GET", path: "/books/1", expectedStatus: 200 },
  { id: 12, name: "404 Route Not Found", method: "GET", path: "/unknown-route-test/", expectedStatus: 404 }
];

async function runTests() {
  console.log("==================================================================");
  console.log(` Starting Lab 4 API Test Suite against: ${BASE_URL}`);
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  for (const test of testScenarios) {
    try {
      const options = {
        method: test.method,
        headers: { "Content-Type": "application/json" }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const res = await fetch(`${BASE_URL}${test.path}`, options);
      const data = await res.json().catch(() => ({}));

      const isStatusOk = res.status === test.expectedStatus;
      let isTokenValid = true;

      if (test.checkToken) {
        if (!data.jwt_token) {
          isTokenValid = false;
        } else {
          const decoded = jwt.decode(data.jwt_token);
          console.log(`       JWT Decoded Payload:`, decoded);
          if (decoded.username !== "roopesh" || decoded.password !== undefined) {
            isTokenValid = false;
          }
        }
      }

      if (isStatusOk && isTokenValid) {
        console.log(`[PASS] Test #${test.id}: ${test.name}`);
        console.log(`       Target: ${test.method} ${test.path}`);
        console.log(`       Status: ${res.status} (Expected: ${test.expectedStatus})`);
        passed++;
      } else {
        console.error(`[FAIL] Test #${test.id}: ${test.name}`);
        console.error(`       Target: ${test.method} ${test.path}`);
        console.error(`       Status: ${res.status} (Expected: ${test.expectedStatus})`);
        console.error(`       Response:`, data);
        failed++;
      }
      console.log("------------------------------------------------------------------");
    } catch (err) {
      console.error(`[ERROR] Test #${test.id}: ${test.name} - ${err.message}`);
      failed++;
      console.log("------------------------------------------------------------------");
    }
  }

  console.log("\n==================================================================");
  console.log(` Test Suite Complete: ${passed} Passed, ${failed} Failed out of ${testScenarios.length}`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

// Start server if testing locally
const server = require("./server");
setTimeout(() => {
  runTests().then(() => {
    process.exit(0);
  });
}, 1000);
