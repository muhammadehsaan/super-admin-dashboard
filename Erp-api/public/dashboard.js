const modeBadge = document.getElementById("modeBadge");
const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeNote = document.getElementById("welcomeNote");
const statusNotice = document.getElementById("statusNotice");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const avatar = document.getElementById("avatar");
const permissionChips = document.getElementById("permissionChips");
const roleChips = document.getElementById("roleChips");
const sessionStatus = document.getElementById("sessionStatus");
const copyTokenBtn = document.getElementById("copyToken");
const signOutBtn = document.getElementById("signOut");

const statUsers = document.getElementById("statUsers");
const statRoles = document.getElementById("statRoles");
const statOrders = document.getElementById("statOrders");
const statApprovals = document.getElementById("statApprovals");

const mockData = {
  user: {
    name: "Super Admin",
    email: "super@erp.com",
    roles: ["super_admin"],
    permissions: [
      "users:create",
      "users:edit",
      "users:delete",
      "users:view",
      "roles:create",
      "roles:edit",
      "roles:delete",
      "roles:assign",
      "inventory:manage",
      "sales:manage",
      "purchases:manage",
      "accounts:manage",
      "reports:view_all",
      "settings:manage",
      "dashboard:full_access",
    ],
  },
  stats: {
    users: 128,
    roles: 5,
    orders: 42,
    approvals: 7,
  },
};

const query = new URLSearchParams(window.location.search);
const isMock = query.get("mock") === "1";
const token = localStorage.getItem("erp_token") || sessionStorage.getItem("erp_token");
const storedUser = JSON.parse(
  localStorage.getItem("erp_user") || sessionStorage.getItem("erp_user") || "null"
);

function setText(el, value) {
  if (!el) return;
  el.textContent = value;
}

function setMode(label, extra) {
  if (!modeBadge) return;
  modeBadge.textContent = label;
  if (extra) {
    modeBadge.classList.add("teal");
  }
}

function buildInitials(name) {
  if (!name) return "SA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0].toUpperCase());
  return letters.join("") || "SA";
}

function renderChips(container, list) {
  if (!container) return;
  container.innerHTML = "";
  list.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = item;
    container.appendChild(chip);
  });
}

function renderDashboard(data) {
  const user = data.user || {};
  const roles = user.roles || [];
  const permissions = user.permissions || [];

  setText(userName, user.name || user.email || "Super Admin");
  setText(userRole, roles.includes("super_admin") ? "Full Control" : "Role Based");
  setText(avatar, buildInitials(user.name || user.email));
  setText(welcomeTitle, `Welcome back, ${user.name || "Super Admin"}`);
  setText(
    welcomeNote,
    roles.includes("super_admin")
      ? "You have complete visibility across users, roles, inventory, sales, purchases, accounts, and system settings."
      : "Your access is limited based on assigned roles and permissions."
  );

  renderChips(permissionChips, permissions);
  renderChips(roleChips, roles);

  if (data.stats) {
    setText(statUsers, String(data.stats.users));
    setText(statRoles, String(data.stats.roles));
    setText(statOrders, String(data.stats.orders));
    setText(statApprovals, String(data.stats.approvals));
  }

  setText(sessionStatus, "Online");
}

async function loadLive() {
  if (!token) {
    setMode("No Session", true);
    setText(sessionStatus, "Offline");
    setText(statusNotice, "No active session. Use login or open demo mode.");
    renderDashboard(mockData);
    return;
  }

  try {
    const res = await fetch("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error("API rejected the session");
    }

    const data = await res.json();
    const user = data.user || storedUser || {};

    renderDashboard({ user, stats: mockData.stats });
    setMode("Live Mode", false);
    setText(statusNotice, "Connected to API.");
  } catch (err) {
    setMode("Offline", true);
    setText(sessionStatus, "Offline");
    setText(statusNotice, "API not reachable. Demo data is shown.");
    renderDashboard(mockData);
  }
}

function loadMock() {
  setMode("Demo Mode", true);
  setText(statusNotice, "Demo mode enabled. Connect DB later for live data.");
  renderDashboard(mockData);
}

if (isMock) {
  loadMock();
} else {
  loadLive();
}

if (copyTokenBtn) {
  copyTokenBtn.addEventListener("click", async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setText(statusNotice, "Token copied.");
    } catch (err) {
      setText(statusNotice, "Unable to copy token.");
    }
  });
}

if (signOutBtn) {
  signOutBtn.addEventListener("click", () => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
    sessionStorage.removeItem("erp_token");
    sessionStorage.removeItem("erp_user");
    window.location.href = "index.html";
  });
}
