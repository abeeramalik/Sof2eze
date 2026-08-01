// MongoDB (via Mongoose) data layer.
//
// This file is intentionally the ONLY place that touches the database
// directly — every route goes through the repository functions exported
// below, never through a raw Mongoose model.
//
// Every document keeps a human-readable `id` string (nanoid) as its real
// identifier, separate from Mongo's own internal `_id`. Routes, the
// frontend, and resume-download URLs all reference `id` — that contract
// doesn't change no matter what's underneath it.

import mongoose from "mongoose";
import { nanoid } from "nanoid";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not set. Add your MongoDB Atlas connection string to .env (see .env.example)."
  );
}

await mongoose.connect(MONGODB_URI);
console.log(`Connected to MongoDB (${mongoose.connection.name})`);

const idField = { type: String, default: () => nanoid(12), unique: true, index: true };
const createdAtField = { type: Date, default: () => new Date() };

const userSchema = new mongoose.Schema({
  id: idField,
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Staff"], required: true },
  createdAt: createdAtField,
});

const contactSubmissionSchema = new mongoose.Schema({
  id: idField,
  name: String,
  email: String,
  subject: String,
  message: String,
  status: { type: String, enum: ["New", "Reviewed", "Archived"], default: "New" },
  reviewedByUserId: { type: String, default: null },
  reviewNotes: { type: String, default: "" },
  createdAt: createdAtField,
});

const applicationSchema = new mongoose.Schema({
  id: idField,
  jobListingId: String,
  applicantName: String,
  email: String,
  coverNote: String,
  resumeUrl: String,
  status: { type: String, enum: ["New", "Reviewed", "Archived"], default: "New" },
  reviewedByUserId: { type: String, default: null },
  reviewNotes: { type: String, default: "" },
  createdAt: createdAtField,
});

const newsletterSubscriberSchema = new mongoose.Schema({
  id: idField,
  email: { type: String, required: true },
  unsubscribeToken: String,
  unsubscribed: { type: Boolean, default: false },
  createdAt: createdAtField,
});

const auditLogSchema = new mongoose.Schema({
  id: idField,
  actorUserId: String,
  actorEmail: String,
  action: String,
  targetKind: String,
  targetId: String,
  fromStatus: String,
  toStatus: String,
  createdAt: createdAtField,
});

const UserModel = mongoose.model("User", userSchema);
const ContactSubmissionModel = mongoose.model("ContactSubmission", contactSubmissionSchema);
const ApplicationModel = mongoose.model("Application", applicationSchema);
const NewsletterSubscriberModel = mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);
const AuditLogModel = mongoose.model("AuditLog", auditLogSchema);

function clean(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = obj;
  return rest;
}
function cleanAll(docs) {
  return docs.map(clean);
}

export const Users = {
  findByEmail: async (email) => clean(await UserModel.findOne({ email: new RegExp(`^${email}$`, "i") })),
  findById: async (id) => clean(await UserModel.findOne({ id })),
  create: async (user) => clean(await UserModel.create(user)),
  all: async () => cleanAll(await UserModel.find({})),
};

export const ContactSubmissions = {
  create: async (data) =>
    clean(await ContactSubmissionModel.create({ ...data, status: "New", reviewedByUserId: null })),
  all: async (filterFn) => {
    const rows = cleanAll(await ContactSubmissionModel.find({}));
    return filterFn ? rows.filter(filterFn) : rows;
  },
  findById: async (id) => clean(await ContactSubmissionModel.findOne({ id })),
  updateStatus: async (id, status, reviewedByUserId, reviewNotes) =>
    clean(
      await ContactSubmissionModel.findOneAndUpdate(
        { id },
        { status, reviewedByUserId, ...(reviewNotes ? { reviewNotes } : {}) },
        { new: true }
      )
    ),
};

export const Applications = {
  create: async (data) =>
    clean(await ApplicationModel.create({ ...data, status: "New", reviewedByUserId: null })),
  all: async (filterFn) => {
    const rows = cleanAll(await ApplicationModel.find({}));
    return filterFn ? rows.filter(filterFn) : rows;
  },
  findById: async (id) => clean(await ApplicationModel.findOne({ id })),
  updateStatus: async (id, status, reviewedByUserId, reviewNotes) =>
    clean(
      await ApplicationModel.findOneAndUpdate(
        { id },
        { status, reviewedByUserId, ...(reviewNotes ? { reviewNotes } : {}) },
        { new: true }
      )
    ),
};

export const NewsletterSubscribers = {
  create: async (data) => clean(await NewsletterSubscriberModel.create({ ...data, unsubscribed: false })),
  findByEmail: async (email) =>
    clean(await NewsletterSubscriberModel.findOne({ email: new RegExp(`^${email}$`, "i") })),
  findByToken: async (token) => clean(await NewsletterSubscriberModel.findOne({ unsubscribeToken: token })),
  unsubscribe: async (id) =>
    clean(await NewsletterSubscriberModel.findOneAndUpdate({ id }, { unsubscribed: true }, { new: true })),
};

export const AuditLogs = {
  create: async (data) => clean(await AuditLogModel.create(data)),
  all: async () => cleanAll(await AuditLogModel.find({})),
};

export default mongoose.connection;