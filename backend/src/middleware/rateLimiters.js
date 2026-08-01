import rateLimit from "express-rate-limit";

// NFR11: rate limiting on public forms to prevent spam/abuse.
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions from this device. Please try again in a few minutes." },
});

// Login gets its own, stricter limiter — this is the endpoint brute-force
// attacks actually target.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in a few minutes." },
});
