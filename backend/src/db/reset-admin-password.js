// One-off utility: updates the password for an existing Admin user.
// Run with: node src/db/reset-admin-password.js
import "dotenv/config";
import { Users } from "./store.js";
import { hashPassword } from "../utils/auth.js";
import mongoose from "mongoose";

const email = process.env.SEED_ADMIN_EMAIL || "admin@sof2eze.test";
const newPassword = process.env.SEED_ADMIN_PASSWORD;

if (!newPassword) {
  console.error("SEED_ADMIN_PASSWORD is not set in .env");
  process.exit(1);
}

const existing = await Users.findByEmail(email);
if (!existing) {
  console.error(`No user found with email ${email}`);
  process.exit(1);
}

const passwordHash = await hashPassword(newPassword);
await mongoose.connection.collection("users").updateOne(
  { email },
  { $set: { passwordHash } }
);

console.log(`Password updated for ${email}`);
process.exit(0);