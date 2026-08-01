// Stand-in for the Strapi headless CMS (owned by the other team member in
// the real project). This exists so the frontend has real content to
// render end-to-end today, and so the "two separate backends" architecture
// in the SRS is actually demonstrated, not just described.
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const PORT = process.env.PORT || 4001;

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

async function loadJson(filename) {
  const raw = await readFile(path.join(DATA_DIR, filename), "utf-8");
  return JSON.parse(raw);
}

function onlyPublished(rows) {
  return rows.filter((r) => r.status === "Published");
}

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "sof2eze-mock-cms" }));

app.get("/api/site-content", async (req, res, next) => {
  try {
    res.json(await loadJson("site-content.json"));
  } catch (err) {
    next(err);
  }
});

app.get("/api/services", async (req, res, next) => {
  try {
    const all = await loadJson("services.json");
    res.json(onlyPublished(all));
  } catch (err) {
    next(err);
  }
});

app.get("/api/team", async (req, res, next) => {
  try {
    res.json(await loadJson("team.json"));
  } catch (err) {
    next(err);
  }
});

app.get("/api/blog", async (req, res, next) => {
  try {
    const all = await loadJson("blog.json");
    res.json(onlyPublished(all));
  } catch (err) {
    next(err);
  }
});

app.get("/api/blog/:id", async (req, res, next) => {
  try {
    const all = await loadJson("blog.json");
    const post = onlyPublished(all).find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

app.get("/api/jobs", async (req, res, next) => {
  try {
    const all = await loadJson("jobs.json");
    res.json(onlyPublished(all));
  } catch (err) {
    next(err);
  }
});

app.get("/api/jobs/:id", async (req, res, next) => {
  try {
    const all = await loadJson("jobs.json");
    const job = onlyPublished(all).find((j) => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: "Job listing not found." });
    res.json(job);
  } catch (err) {
    next(err);
  }
});

app.get("/api/portfolio", async (req, res, next) => {
  try {
    const all = await loadJson("portfolio.json");
    res.json(onlyPublished(all));
  } catch (err) {
    next(err);
  }
});

app.get("/api/testimonials", async (req, res, next) => {
  try {
    const all = await loadJson("testimonials.json");
    res.json(onlyPublished(all));
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` }));
app.use((err, req, res, next) => {
  console.error("[mock-cms error]", err);
  res.status(500).json({ error: "Mock CMS error." });
});

app.listen(PORT, () => {
  console.log(`sof2eze mock-cms listening on http://localhost:${PORT}`);
});
