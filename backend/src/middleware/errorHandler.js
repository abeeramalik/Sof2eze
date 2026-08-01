import { ZodError } from "zod";
import { InvalidTransitionError } from "../utils/statusMachine.js";
import { MulterError } from "multer";

// Centralized error handler. Never leaks stack traces or internal details
// to the client (NFR8) — logs the full error server-side, returns a clean,
// generic message plus a machine-readable code the frontend can branch on.
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed.",
      details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof InvalidTransitionError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  if (err.status === 415 || err.message === "UNSUPPORTED_FILE_TYPE") {
    return res.status(415).json({ error: "Unsupported file type. Please upload a PDF or Word document." });
  }

  console.error("[unhandled error]", err);
  return res.status(500).json({ error: "Something went wrong on our end. Please try again." });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}
