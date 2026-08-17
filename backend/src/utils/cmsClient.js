// The ONLY place the custom backend talks to the CMS API. This exists
// solely to support FR15 (site-wide search), which per the SRS is
// "implemented as backend filtering/query matching over CMS content" — see
// the system context diagram (SRS 6.1), which shows an explicit
// Backend -> CMS "query content (search)" edge distinct from the frontend's
// own direct read calls to the CMS.
//
// This client only ever reads (GET) — the backend never writes to the CMS,
// same rule that applies to the frontend (guardrail #1).

const CMS_BASE_URL = process.env.CMS_API_URL || "http://localhost:1337";

export async function searchCmsContent(query) {
  const [servicesRes, blogRes] = await Promise.all([
    fetch(`${CMS_BASE_URL}/api/services`),
    fetch(`${CMS_BASE_URL}/api/blog`),
  ]);

  if (!servicesRes.ok || !blogRes.ok) {
    throw new Error("CMS_UNAVAILABLE");
  }

  const [services, blogPosts] = await Promise.all([servicesRes.json(), blogRes.json()]);
  const needle = query.trim().toLowerCase();

  const matchedServices = services
    .filter((s) => s.status === "Published")
    .filter((s) => `${s.title} ${s.description}`.toLowerCase().includes(needle))
    .map((s) => ({ type: "service", id: s.id, title: s.title, excerpt: s.description }));

  const matchedPosts = blogPosts
    .filter((p) => p.status === "Published")
    .filter((p) => `${p.title} ${p.body}`.toLowerCase().includes(needle))
    .map((p) => ({ type: "blog", id: p.id, title: p.title, excerpt: p.body.slice(0, 160) }));

  return [...matchedServices, ...matchedPosts];
}
