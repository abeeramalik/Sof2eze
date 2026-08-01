import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);

function requireSecret(name) {
  const value = process.env[name];
  if (!value || value.length < 16) {
    throw new Error(
      `${name} is missing or too short. Set a strong random value in your .env file (see .env.example).`
    );
  }
  return value;
}

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Short-lived JWT access token (FR22). The frontend is expected to hold this
// in memory only — never localStorage/sessionStorage — so a stolen token's
// blast radius is bounded by ACCESS_TOKEN_TTL, not by an explicit revoke.
export function signAccessToken(user) {
  const secret = requireSecret("JWT_ACCESS_SECRET");
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, secret, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function verifyAccessToken(token) {
  const secret = requireSecret("JWT_ACCESS_SECRET");
  return jwt.verify(token, secret); // throws on invalid/expired
}

// Longer-lived refresh token, delivered only via httpOnly cookie (FR22) —
// never readable by client-side JS, which is what makes it safe to live
// longer than the access token.
export function signRefreshToken(user) {
  const secret = requireSecret("JWT_REFRESH_SECRET");
  return jwt.sign({ sub: user.id }, secret, { expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` });
}

export function verifyRefreshToken(token) {
  const secret = requireSecret("JWT_REFRESH_SECRET");
  return jwt.verify(token, secret);
}

export const REFRESH_COOKIE_NAME = "sof2eze_refresh";
export const REFRESH_COOKIE_MAX_AGE_MS = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
