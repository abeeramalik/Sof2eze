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
import { v2 as cloudinary } from "cloudinary";

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

// CLOUDINARY_URL, if set, is read automatically by the SDK on `.config()`
// with no arguments — that's why there's no explicit key/secret here.
let cloudinaryConfigured = false;
function ensureCloudinaryConfigured() {
  if (cloudinaryConfigured) return;
  if (!process.env.CLOUDINARY_URL) {
    throw new Error(
      "STORAGE_DRIVER=cloudinary but CLOUDINARY_URL is not set. Add it to your .env " +
        "(see .env.example) or switch STORAGE_DRIVER back to 'local' for development."
    );
  }
  cloudinary.config(); // reads CLOUDINARY_URL from process.env automatically
  cloudinaryConfigured = true;
}

async function storeCloudinary(buffer, originalName) {
  ensureCloudinaryConfigured();

  const safeExt = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const publicId = `sof2eze/resumes/${nanoid(16)}`;

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // resumes are PDFs/docs, not images — "raw" preserves the original file as-is
        public_id: publicId,
        // Keeping the original extension in the delivered URL so downstream
        // code / admins opening the link get a sane filename, since "raw"
        // uploads don't infer a format like image uploads do.
        format: safeExt.replace(".", "") || undefined,
      },
      (error, uploadResult) => {
        if (error) reject(error);
        else resolve(uploadResult);
      }
    );
    uploadStream.end(buffer);
  });

  return { url: result.secure_url, storageKey: result.public_id };
}

export async function storeResume(buffer, originalName) {
  if (driver === "cloudinary") return storeCloudinary(buffer, originalName);
  return storeLocal(buffer, originalName);
}