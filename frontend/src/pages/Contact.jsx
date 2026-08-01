import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { backend } from "../api/backendClient";
import { PageHeader, PrimaryButton, TextInput, TextArea, ErrorBlock } from "../components/ui";

function validate(form) {
  const errors = {};
  if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email address.";
  if (!form.subject.trim() || form.subject.trim().length < 2) errors.subject = "Enter a subject.";
  if (!form.message.trim() || form.message.trim().length < 10) errors.message = "Message should be at least 10 characters.";
  return errors;
}

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("submitting");
    setSubmitError("");
    try {
      await backend.submitContact(form);
      setStatus("done");
      setForm(EMPTY_FORM);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Contact" title="Let's talk about your project" description="Tell us a bit about what you're building. We typically reply within two business days." />

      <section className="mx-auto max-w-2xl px-5 py-16">
        {status === "done" ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-mustard-500/30 bg-mustard-500/10 px-6 py-14 text-center">
            <CheckCircle2 className="text-mustard-600" size={32} />
            <h2 className="font-display text-xl font-semibold text-ink-900">Thanks for reaching out</h2>
            <p className="max-w-sm text-sm text-fog-600">We'll get back to you soon.</p>
            <button onClick={() => setStatus("idle")} className="mt-2 text-sm font-medium text-mustard-600 hover:text-mustard-700">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-fog-200 bg-mustard-50 p-7 transition-all duration-300 hover:border-mustard-300 hover:shadow-lg" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput label="Name" id="name" value={form.name} onChange={handleChange("name")} error={fieldErrors.name} placeholder="Ahmad Raza" />
              <TextInput label="Email" id="email" type="email" value={form.email} onChange={handleChange("email")} error={fieldErrors.email} placeholder="ahmad@example.com" />
            </div>
            <TextInput label="Subject" id="subject" value={form.subject} onChange={handleChange("subject")} error={fieldErrors.subject} placeholder="What's this about?" />
            <TextArea label="Message" id="message" rows={6} value={form.message} onChange={handleChange("message")} error={fieldErrors.message} placeholder="Tell us a bit more…" />

            {status === "error" && <ErrorBlock message={submitError} />}

            <PrimaryButton type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
              {status === "submitting" ? "Sending…" : "Send message"}
            </PrimaryButton>
          </form>
        )}
      </section>
    </div>
  );
}
