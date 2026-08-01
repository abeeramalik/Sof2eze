// Client for the CMS's public read API — see SRS FR23 / guardrail #1:
// the frontend NEVER writes to the CMS, and never touches its database.
// This file only ever issues GET requests, on purpose.

const CMS_BASE_URL = import.meta.env.VITE_CMS_API_URL || "http://localhost:4001";

async function get(path) {
  const res = await fetch(`${CMS_BASE_URL}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `CMS request failed (${res.status})`);
  }
  return res.json();
}

export const cms = {
  getSiteContent: () => get("/api/site-content"),
  getServices: () => get("/api/services"),
  getTeam: () => get("/api/team"),
  getBlogPosts: () => get("/api/blog"),
  getBlogPost: (id) => get(`/api/blog/${id}`),
  getJobs: () => get("/api/jobs"),
  getJob: (id) => get(`/api/jobs/${id}`),
  getPortfolio: () => get("/api/portfolio"),
  getTestimonials: () => get("/api/testimonials"),
};
