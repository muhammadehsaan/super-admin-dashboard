const TOKEN_KEY = "erp_token";
const USER_KEY = "erp_user";

export function saveAuth(token, user, remember) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadAuth() {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  const user = userRaw ? JSON.parse(userRaw) : null;
  return { token, user };
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
