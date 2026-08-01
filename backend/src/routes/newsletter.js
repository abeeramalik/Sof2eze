import { Router } from "express";
import crypto from "node:crypto";
import { NewsletterSubscribers } from "../db/store.js";
import { newsletterSchema } from "../utils/schemas.js";
import { publicFormLimiter } from "../middleware/rateLimiters.js";
import { sendEmail } from "../utils/email.js";

const router = Router();

router.post("/subscribe", publicFormLimiter, async (req, res, next) => {
  try {
    const { email } = newsletterSchema.parse(req.body);

    const existing = await NewsletterSubscribers.findByEmail(email);
    if (existing && !existing.unsubscribed) {
      return res.status(200).json({ message: "You're already subscribed." });
    }

    const unsubscribeToken = crypto.randomBytes(24).toString("hex");
    await NewsletterSubscribers.create({ email, unsubscribeToken });

    try {
      await sendEmail({
        to: email,
        subject: "You're subscribed to the Sof2eze newsletter",
        body: `Thanks for subscribing! Unsubscribe any time: ${process.env.FRONTEND_URL || "http://localhost:5173"}/unsubscribe?token=${unsubscribeToken}`,
      });
    } catch (emailErr) {
      console.error("[newsletter] confirmation email failed (subscription still stored):", emailErr.message);
    }

    res.status(201).json({ message: "Subscribed! Check your inbox for a confirmation." });
  } catch (err) {
    next(err);
  }
});

router.get("/unsubscribe", async (req, res, next) => {
  try {
    const token = String(req.query.token || "");
    const subscriber = await NewsletterSubscribers.findByToken(token);
    if (!subscriber) {
      return res.status(404).json({ error: "Invalid or already-used unsubscribe link." });
    }
    await NewsletterSubscribers.unsubscribe(subscriber.id);
    res.json({ message: "You've been unsubscribed." });
  } catch (err) {
    next(err);
  }
});

export default router;
