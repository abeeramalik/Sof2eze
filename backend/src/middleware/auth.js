import { verifyAccessToken } from "../utils/auth.js";

// FR16: any internal/admin route must require authentication.
// Expects `Authorization: Bearer <token>`. Rejects missing/invalid/expired
// tokens uniformly with 401 so the frontend can redirect to login without
// needing to distinguish "no token" from "bad token" from "expired token".
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
}

// FR17: Admin = full access, Staff = view-only on submissions.
// Usage: requireRole("Admin") or requireRole("Admin", "Staff")
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}
