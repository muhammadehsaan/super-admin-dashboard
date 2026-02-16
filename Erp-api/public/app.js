const form = document.getElementById("loginForm");
const statusEl = document.getElementById("status");
const rememberEl = document.getElementById("remember");

function setStatus(message) {
  if (!statusEl) return;
  statusEl.textContent = message || "";
}

function storeAuth(token, user, remember) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("erp_token", token);
  storage.setItem("erp_user", JSON.stringify(user));
}

async function handleLogin(event) {
  event.preventDefault();
  setStatus("");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Login failed");
    }

    const data = await res.json();
    storeAuth(data.token, data.user, rememberEl.checked);
    window.location.href = "dashboard.html";
  } catch (err) {
    setStatus(err.message || "Unable to connect to API");
  }
}

if (form) {
  form.addEventListener("submit", handleLogin);
}
