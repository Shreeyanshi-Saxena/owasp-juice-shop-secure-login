// client-side validation + send login request to server

const form = document.getElementById("loginForm");
const errorBox = document.getElementById("error");
const resultBox = document.getElementById("result");

// checks the email has an "@" and password is at least 8 chars
function validate(email, password) {
  if (!email || !password) {
    return "Please fill in both fields.";
  }
  if (email.indexOf("@") === -1) {
    return "Email must contain an @ symbol.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return null; // ok
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  errorBox.textContent = "";
  resultBox.innerHTML = "";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const problem = validate(email, password);
  if (problem) {
    errorBox.textContent = problem;
    return;
  }

  // hand off to the server, which validates again + checks credentials
  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.ok) {
      // NOTE: intentionally using innerHTML here so the XSS test works
      resultBox.innerHTML =
        "<span style='color:green'>Welcome back, " + data.user + "</span>";
    } else {
      resultBox.innerHTML =
        "<span style='color:#c0392b'>" + data.message + "</span>";
    }
  } catch (err) {
    resultBox.textContent = "Could not reach server.";
  }
});
