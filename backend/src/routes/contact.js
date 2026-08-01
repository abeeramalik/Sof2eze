import { Router } from "express";
import { ContactSubmissions } from "../db/store.js";
import { contactSchema } from "../utils/schemas.js";
import { publicFormLimiter } from "../middleware/rateLimiters.js";
import { sendEmail } from "../utils/email.js";

const router = Router();

router.post("/", publicFormLimiter, async (req, res, next) => {
  try {
    const data = contactSchema.parse(req.body);
    const submission = await ContactSubmissions.create(data);

    try {
      await sendEmail({
        to: process.env.STAFF_NOTIFICATION_EMAIL || "staff@example.com",
        subject: `New contact submission: ${data.subject}`,
        body: `From: ${data.name} <${data.email}>\n\n${data.message}`,
      });
    } catch (emailErr) {
      console.error("[contact] notification email failed (submission still stored):", emailErr.message);
    }

    res.status(201).json({
      message: "Thanks for reaching out. We'll get back to you soon.",
      id: submission.id,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
