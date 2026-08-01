import multer from "multer";

// FR12 / NFR9: resumes must be restricted by type and size, and are never
// written to local application disk in a way the app treats as permanent
// storage. We use memoryStorage() so the file only ever exists transiently
// in the request, then gets handed to `cloudStorage.js` (which stands in
// for Cloudinary/S3) — the backend process itself stays stateless.
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const err = new Error("UNSUPPORTED_FILE_TYPE");
    err.status = 415;
    return cb(err);
  }
  cb(null, true);
}

export const resumeUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
});
