// test-api.js
// Automated verification test runner for Lab 3 REST API
const http = require("http");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const testScenarios = [
  { id: 1, name: "API Directory & Info", method: "GET", path: "/", expectedStatus: 200 },
  { id: 2, name: "GET All Books (Default limit=10)", method: "GET", path: "/books/", expectedStatus: 200 },
  { id: 3, name: "Search by Title (search_q=JavaScript)", method: "GET", path: "/books/?search_q=JavaScript", expectedStatus: 200 },
  { id: 4, name: "Sorting by Price DESC", method: "GET", path: "/books/?order_by=price&order=DESC", expectedStatus: 200 },
  { id: 5, name: "Pagination (limit=3&offset=3)", method: "GET", path: "/books/?limit=3&offset=3", expectedStatus: 200 },
  { id: 6, name: "Price Range Filter (400-800)", method: "GET", path: "/books/?min_price=400&max_price=800", expectedStatus: 200 },
  { id: 7, name: "Combined Filters (Search + Sort + Price + Page)", method: "GET", path: "/books/?search_q=the&min_price=200&max_price=900&order_by=price&order=DESC&limit=4&offset=0", expectedStatus: 200 },
  { id: 8, name: "GET Single Book by ID (/books/1)", method: "GET", path: "/books/1", expectedStatus: 200 },
  {
    id: 9,
    name: "POST Create Book",
    method: "POST",
    path: "/books/",
    expectedStatus: 201,
    body: { title: "Test Book Automation", author: "Vankadari Roopesh", price: 650, pages: 280 }
  },
  {
    id: 10,
    name: "PUT Update Book (/books/1)",
    method: "PUT",
    path: "/books/1",
    expectedStatus: 200,
    body: { title: "The Pragmatic Programmer (Updated Edition)", author: "David Thomas, Andrew Hunt", price: 799, pages: 360 }
  },
  { id: 11, name: "DELETE Book (/books/15)", method: "DELETE", path: "/books/15", expectedStatus: 200 },
  {
    id: 12,
    name: "Validation: Missing Title",
    method: "POST",
    path: "/books/",
    expectedStatus: 400,
    body: { author: "Anonymous", price: 300 }
  },
  {
    id: 13,
    name: "Validation: Non-numeric Price",
    method: "POST",
    path: "/books/",
    expectedStatus: 400,
    body: { title: "Invalid Price Book", author: "Tester", price: "three-hundred" }
  },
  { id: 14, name: "Validation: Invalid order_by column", method: "GET", path: "/books/?order_by=hacked_col", expectedStatus: 400 },
  { id: 15, name: "Validation: Negative limit", method: "GET", path: "/books/?limit=-5", expectedStatus: 400 },
  { id: 16, name: "Not Found: Non-existent ID (/books/999)", method: "GET", path: "/books/999", expectedStatus: 404 },
  { id: 17, name: "Not Found: Unknown Route", method: "GET", path: "/non-existent-endpoint", expectedStatus: 404 }
];

async function runTests() {
  console.log("==================================================================");
  console.log(` Starting Lab 3 API Test Suite against: ${BASE_URL}`);
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

      if (isStatusOk) {
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

runTests();

