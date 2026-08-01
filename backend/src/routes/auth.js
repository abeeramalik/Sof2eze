import { Router } from "express";
import { Users } from "../db/store.js";
import {
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_MS,
} from "../utils/auth.js";
import { loginSchema } from "../utils/schemas.js";
import { loginLimiter } from "../middleware/rateLimiters.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  path: "/api/auth",
};

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await Users.findByEmail(email);

    const genericError = () => res.status(401).json({ error: "Invalid email or password." });

    if (!user) return genericError();

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return genericError();

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTS);

    res.json({
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "No active session." });

  try {
    const payload = verifyRefreshToken(token);
    const user = await Users.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "No active session." });

    const accessToken = signAccessToken(user);
    res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch {
    res.status(401).json({ error: "Session expired. Please log in again." });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  res.json({ message: "Logged out." });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
