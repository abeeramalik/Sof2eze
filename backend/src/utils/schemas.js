import { z } from "zod";

// FR14: validate on both frontend AND backend. This file is the backend's
// half — never trust client-side validation as the real security boundary.

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  subject: z.string().trim().min(2, "Subject is too short.").max(200),
  message: z.string().trim().min(10, "Message should be at least 10 characters.").max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(200),
});

export const applicationSchema = z.object({
  jobListingId: z.string().trim().min(1, "Job listing is required."),
  applicantName: z.string().trim().min(2, "Name is too short.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  coverNote: z.string().trim().max(5000).optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["New", "Reviewed", "Archived"]),
  reviewNotes: z.string().trim().max(2000).optional().default(""),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
});
