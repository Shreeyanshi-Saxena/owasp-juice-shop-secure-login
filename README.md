# OWASP Juice Shop – Secure Login Form (CSR703 HW2)

A small login page that mimics the OWASP Juice Shop login screen. It was built
for the HW2 assignment to practice client-side and server-side validation, and
then to test SQL Injection / XSS against it.

## What it does

- Email + password login form (looks similar to Juice Shop's).
- **Client-side validation** (in `public/app.js`): blocks empty fields, checks
  the email has an `@`, and checks the password is at least 8 characters.
- **Server-side validation** (in `server.js`): the same rules are checked again
  on the server so they can't be skipped by turning off JavaScript.
- Small in-memory SQLite database with two seeded accounts.
- Two login routes:
  - `POST /login` – the version wired to the form. Written the insecure way on
    purpose (string-built SQL query + echoes input back) so it can be attacked
    in Part 3.
  - `POST /login-secure` – the fixed version. Uses a parameterized query and
    checks the password with **bcrypt**.

Seeded test accounts:

| email | password |
|-------|----------|
| admin@juice-sh.op | admin123 |
| user@juice-sh.op | orange456 |

## How to run

You need Node.js installed (built with Node 20+).

```bash
git clone https://github.com/Shreeyanshi-Saxena/owasp-juice-shop-secure-login.git
cd owasp-juice-shop-secure-login
npm install
npm start
```

Then open <http://localhost:3000> in a browser and log in.

(If port 3000 is busy you can run `PORT=4000 npm start` and use that port.)

## Files

- `public/index.html` – the form
- `public/style.css` – styling
- `public/app.js` – client-side validation + sends the request
- `server.js` – Express server, database, and the two login routes

## Note

The `/login` route is intentionally vulnerable for the assignment. Don't reuse
this code as-is in a real project — use the `/login-secure` route's approach
(parameterized queries + bcrypt + escaping output) instead.
