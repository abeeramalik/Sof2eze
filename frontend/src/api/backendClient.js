// Client for the custom Express backend. All user actions (forms,
// applications, admin operations) go through here — see FR24.
//
// Auth token handling (guardrail #3): the access token is passed in from
// AuthContext on every call and held only in memory there — this file never
// reads or writes localStorage/sessionStorage itself, and never should.

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4000";

async function request(path, { method = "GET", body, accessToken, isFormData = false } = {}) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }
  return data;
}

export const backend = {
  submitContact: (payload) => request("/api/contact", { method: "POST", body: payload }),
  subscribeNewsletter: (email) =>
    request("/api/newsletter/subscribe", { method: "POST", body: { email } }),
  unsubscribeNewsletter: (token) =>
    request(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`),
  submitApplication: (formData) =>
    request("/api/applications", { method: "POST", body: formData, isFormData: true }),
  search: (q) => request(`/api/search?q=${encodeURIComponent(q)}`),

  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password } }),
  refresh: () => request("/api/auth/refresh", { method: "POST" }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: (accessToken) => request("/api/auth/me", { accessToken }),

  listSubmissions: (accessToken, status) =>
    request(`/api/admin/submissions${status ? `?status=${status}` : ""}`, { accessToken }),
updateSubmissionStatus: (accessToken, kind, id, status, reviewNotes) =>
    request(`/api/admin/submissions/${kind}/${id}/status`, {
      method: "PATCH",
      accessToken,
      body: { status, ...(reviewNotes ? { reviewNotes } : {}) },
    }),
  resumeDownloadUrl: (id) => `${BACKEND_BASE_URL}/api/admin/applications/${id}/resume`,
};

export { BACKEND_BASE_URL };
