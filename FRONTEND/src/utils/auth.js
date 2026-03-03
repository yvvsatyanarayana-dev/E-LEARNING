export function setAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = options.headers ? { ...options.headers } : {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  options.headers = headers;
  return fetch(url, options);
}

export const ROLE_REDIRECTS = {
  student: "/studentdashboard",
  faculty: "/facultydashboard",
  placement_officer: "/placement/dashboard",
  admin: "/admin/dashboard",
};
