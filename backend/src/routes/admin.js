import { Router } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import { ContactSubmissions, Applications, AuditLogs } from "../db/store.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { assertValidTransition } from "../utils/statusMachine.js";
import { statusUpdateSchema } from "../utils/schemas.js";
import { sendEmail } from "../utils/email.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

const router = Router();

router.use(requireAuth);

router.get("/submissions", requireRole("Admin", "Staff"), async (req, res) => {
  const statusFilter = req.query.status;
  const matchesStatus = (row) => !statusFilter || row.status === statusFilter;

  const contacts = (await ContactSubmissions.all(matchesStatus)).map((c) => ({
    ...c,
    kind: "contact",
  }));
  const applications = (await Applications.all(matchesStatus)).map((a) => ({
    ...a,
    kind: "application",
  }));

  const all = [...contacts, ...applications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.json({
    counts: {
      new: all.filter((r) => r.status === "New").length,
      reviewed: all.filter((r) => r.status === "Reviewed").length,
      archived: all.filter((r) => r.status === "Archived").length,
    },
    submissions: all,
  });
});

router.patch("/submissions/:kind/:id/status", requireRole("Admin"), async (req, res, next) => {
  try {
    const { kind, id } = req.params;
    const { status: nextStatus, reviewNotes } = statusUpdateSchema.parse(req.body);

    const repo = kind === "contact" ? ContactSubmissions : kind === "application" ? Applications : null;
    if (!repo) return res.status(400).json({ error: "Unknown submission kind." });

    const record = await repo.findById(id);
    if (!record) return res.status(404).json({ error: "Submission not found." });

    assertValidTransition(record.status, nextStatus);

    const updated = await repo.updateStatus(id, nextStatus, req.user.id, reviewNotes);

    await AuditLogs.create({
      actorUserId: req.user.id,
      actorEmail: req.user.email,
      action: "status_change",
      targetKind: kind,
      targetId: id,
      fromStatus: record.status,
      toStatus: nextStatus,
    });

    // Send email notification to the submitter — FR25: never block on email failure
    const submitterEmail = record.email;
    if (submitterEmail) {
      const statusLabel = nextStatus === "Reviewed" ? "reviewed" : "archived";
      const notesSection = reviewNotes ? `\n\nReview notes from the team:\n${reviewNotes}` : "";
      const emailBody = `Hi${record.name || record.applicantName ? " " + (record.name || record.applicantName) : ""},\n\nYour submission has been ${statusLabel}.${notesSection}\n\nThanks,\nThe Sof2eze team`;

      sendEmail({
        to: submitterEmail,
        subject: `Your submission has been ${statusLabel}`,
        body: emailBody,
      }).catch((emailErr) => {
        console.error("[admin] status notification email failed (status update still succeeded):", emailErr.message);
      });
    }

    res.json({ submission: { ...updated, kind } });
  } catch (err) {
    next(err);
  }
});

router.get("/applications/:id/resume", requireRole("Admin", "Staff"), async (req, res, next) => {
  try {
    const application = await Applications.findById(req.params.id);
    if (!application) return res.status(404).json({ error: "Application not found." });

    if (!application.resumeUrl.startsWith("/uploads/")) {
      // Stream the file from Cloudinary through our own server instead of
      // redirecting the browser there directly — a redirected fetch() call
      // hits Cloudinary as a fresh cross-origin request and gets blocked by
      // CORS, since our frontend sends an Authorization header via fetch()
      // rather than a plain <a href>.
      const cloudRes = await fetch(application.resumeUrl);
      if (!cloudRes.ok) {
        return res.status(cloudRes.status).json({ error: "Resume file not found." });
      }
      res.setHeader("Content-Type", cloudRes.headers.get("content-type") || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="resume"`);
      const buffer = Buffer.from(await cloudRes.arrayBuffer());
      return res.send(buffer);
    }

    const filename = path.basename(application.resumeUrl);
    const fullPath = path.join(UPLOAD_DIR, filename);
    await fs.access(fullPath);
    res.download(fullPath);
  } catch (err) {
    if (err.code === "ENOENT") return res.status(404).json({ error: "Resume file not found." });
    next(err);
  }
});

export default router;
