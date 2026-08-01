// Run with `npm run seed`. Creates the first Admin user so you can actually
// log into the dashboard. Safe to re-run — skips if the user already exists.
import "dotenv/config";
import { Users } from "./store.js";
import { hashPassword } from "../utils/auth.js";

const email = process.env.SEED_ADMIN_EMAIL || "admin@sof2eze.test";
const password = process.env.SEED_ADMIN_PASSWORD;

if (!password) {
  console.error(
    "Set SEED_ADMIN_PASSWORD in your .env before seeding (see .env.example). Refusing to create an admin with a default password."
  );
  process.exit(1);
}

const existing = await Users.findByEmail(email);
if (existing) {
  console.log(`Admin user ${email} already exists — nothing to do.`);
  process.exit(0);
}

const passwordHash = await hashPassword(password);
await Users.create({ email, passwordHash, role: "Admin" });
console.log(`Created Admin user: ${email}`);
