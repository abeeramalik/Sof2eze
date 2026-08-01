import { Router } from "express";
import { Applications } from "../db/store.js";
import { applicationSchema } from "../utils/schemas.js";
import { publicFormLimiter } from "../middleware/rateLimiters.js";
import { resumeUpload } from "../utils/upload.js";
import { storeResume } from "../utils/cloudStorage.js";
import { sendEmail } from "../utils/email.js";

const router = Router();

router.post("/", publicFormLimiter, resumeUpload.single("resume"), async (req, res, next) => {
  try {
    const data = applicationSchema.parse(req.body);

    if (!req.file) {
      return res.status(400).json({ error: "A resume file is required." });
    }

    let resumeUrl;
    try {
      const stored = await storeResume(req.file.buffer, req.file.originalname);
      resumeUrl = stored.url;
    } catch (storageErr) {
      console.error("[applications] resume upload failed:", storageErr.message);
      return res.status(502).json({
        error: "We couldn't upload your resume right now. Please try again in a moment.",
      });
    }

    let application;
    try {
      application = await Applications.create({ ...data, resumeUrl });
    } catch (dbErr) {
      console.error(
        `[applications] DB write failed after resume upload succeeded (orphaned file: ${resumeUrl}):`,
        dbErr.message
      );
      throw dbErr;
    }

    try {
      await sendEmail({
        to: data.email,
        subject: "We've received your application",
        body: `Hi ${data.applicantName}, thanks for applying. We'll be in touch.`,
      });
    } catch (emailErr) {
      console.error("[applications] confirmation email failed (application still stored):", emailErr.message);
    }

    res.status(201).json({
      message: "Application submitted. Good luck!",
      id: application.id,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
