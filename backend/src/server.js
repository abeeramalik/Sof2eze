import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contact.js";
import newsletterRoutes from "./routes/newsletter.js";
import applicationRoutes from "./routes/applications.js";
import adminRoutes from "./routes/admin.js";
import searchRoutes from "./routes/search.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173").split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or curl)
      if (!origin) return callback(null, true);
      
      // Automatically allow any localhost port for local development
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      
      // Check against configured production origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

if ((process.env.STORAGE_DRIVER || "local") === "local") {
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
}

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "sof2eze-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`sof2eze backend listening on http://localhost:${PORT}`);
});