// Simple login backend for the CSR703 assignment.
// Mimics the Juice Shop login flow so we can test SQLi / XSS on it.
//
// NOTE: the /login route is written the "wrong" way on purpose (string
// concatenation) so Part 3 has a real vulnerability to break. The /login-secure
// route below shows how it should actually be done (parameterized + bcrypt).

const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { DatabaseSync } = require("node:sqlite");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ---- tiny in-memory database ----
const db = new DatabaseSync(":memory:");
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT,
    passwordHash TEXT,   -- md5, like the real Juice Shop (weak on purpose)
    bcryptHash TEXT      -- what a real app should store
  );
`);

function md5(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

// seed a couple of accounts
const seed = [
  { email: "admin@juice-sh.op", pass: "admin123" },
  { email: "user@juice-sh.op", pass: "orange456" },
];
for (const u of seed) {
  db.prepare(
    "INSERT INTO users (email, passwordHash, bcryptHash) VALUES (?, ?, ?)"
  ).run(u.email, md5(u.pass), bcrypt.hashSync(u.pass, 10));
}

// server-side validation (same rules as the client)
function validate(email, password) {
  if (!email || !password) return "Both fields are required.";
  if (typeof email !== "string" || typeof password !== "string")
    return "Bad input.";
  if (!email.includes("@")) return "Email must contain an @.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

// ---------- VULNERABLE login (used by the form) ----------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const problem = validate(email, password);
  if (problem) return res.json({ ok: false, message: problem });

  // BAD: user input dropped straight into the SQL string
  const sql =
    "SELECT * FROM users WHERE email = '" +
    email +
    "' AND passwordHash = '" +
    md5(password) +
    "'";
  console.log("Running query:", sql);

  try {
    const row = db.prepare(sql).get();
    if (row) {
      return res.json({ ok: true, user: row.email });
    }
    // BAD: echoes the raw email back, which the client drops into innerHTML -> reflected XSS
    return res.json({
      ok: false,
      message: "No account found for " + email,
    });
  } catch (e) {
    return res.json({ ok: false, message: "Query error: " + e.message });
  }
});

// ---------- SECURE login (the fix) ----------
app.post("/login-secure", (req, res) => {
  const { email, password } = req.body;

  const problem = validate(email, password);
  if (problem) return res.json({ ok: false, message: problem });

  // GOOD: parameterized query, so input can never change the SQL
  const row = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  // GOOD: verify with bcrypt instead of a raw hash compare
  if (row && bcrypt.compareSync(password, row.bcryptHash)) {
    return res.json({ ok: true, user: row.email });
  }
  return res.json({ ok: false, message: "Invalid email or password." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Login demo running at http://localhost:${PORT}`);
});
