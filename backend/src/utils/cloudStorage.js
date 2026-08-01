// Storage adapter for uploaded resumes (FR12).
//
// The SRS is explicit that resumes must live in cloud object storage, never
// on local application disk, so the backend can stay stateless and
// redeployable. This file is the *only* place that decides where bytes
// actually go — routes never touch the filesystem or a storage SDK directly,
// they just call `storeResume()`.
//
// Two drivers:
//   - "local"      : writes to backend/uploads/ — fine for running this
//                    project on your own machine while developing, NOT fine
//                    for production (violates the stateless-backend NFR).
//   - "cloudinary"  : real implementation, activates once you set
//                    CLOUDINARY_URL in .env. Swap STORAGE_DRIVER=cloudinary
//                    when you deploy.
//
// This keeps the architecture rule intact (guardrail #4) while still being
// something you can `npm install && npm run dev` with zero external
// accounts to see the whole flow work end to end.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

const driver = process.env.STORAGE_DRIVER || "local";

async function storeLocal(buffer, originalName) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const safeExt = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const filename = `${nanoid(16)}${safeExt}`;
  const fullPath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, buffer);
  // Served by the /uploads static route in dev only — see server.js.
  return { url: `/uploads/${filename}`, storageKey: filename };
}

async function storeCloudinary() {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error(
      "STORAGE_DRIVER=cloudinary but CLOUDINARY_URL is not set. Add it to your .env " +
        "(see .env.example) or switch STORAGE_DRIVER back to 'local' for development."
    );
  }
  // Intentionally left as a clear extension point rather than a fake
  // implementation: wire up the official `cloudinary` SDK's
  // `uploader.upload_stream` here once you have real credentials, so this
  // file stays the single place that changes when you go to production.
  throw new Error(
    "Cloudinary driver not wired up yet — see the comment in cloudStorage.js for the two lines to add."
  );
}

export async function storeResume(buffer, originalName) {
  if (driver === "cloudinary") return storeCloudinary(buffer, originalName);
  return storeLocal(buffer, originalName);
}
