import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, UploadCloud } from "lucide-react";
import { cms } from "../api/cmsClient";
import { backend } from "../api/backendClient";
import { useFetch } from "../hooks/useFetch";
import { LoadingBlock, ErrorBlock, Badge, PrimaryButton, TextInput, TextArea, FieldError } from "../components/ui";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function validate(form, file) {
  const errors = {};
  if (!form.applicantName.trim() || form.applicantName.trim().length < 2) {
    errors.applicantName = "Enter your full name.";
  }
  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!file) {
    errors.resume = "Attach your resume (PDF or Word).";
  } else if (!ALLOWED_TYPES.includes(file.type)) {
    errors.resume = "Resume must be a PDF or Word document.";
  } else if (file.size > MAX_FILE_SIZE) {
    errors.resume = "Resume must be under 5MB.";
  }
  return errors;
}

export default function JobDetail() {
  const { id } = useParams();
  const fetcher = useCallback(() => cms.getJob(id), [id]);
  const { data: job, error, loading } = useFetch(fetcher, [id]);

  const [form, setForm] = useState({ applicantName: "", email: "", coverNote: "" });
  const [file, setFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error
  const [submitError, setSubmitError] = useState("");

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // FR14: client-side validation — a UX nicety, not the real security
    // boundary. The backend re-validates everything independently.
    const errors = validate(form, file);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("submitting");
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("jobListingId", id);
      formData.append("applicantName", form.applicantName);
      formData.append("email", form.email);
      formData.append("coverNote", form.coverNote);
      formData.append("resume", file);

      await backend.submitApplication(formData);
      setStatus("done");
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (loading) return <LoadingBlock label="Loading job listing…" />;
  if (error) return <ErrorBlock message="We couldn't find that job listing." />;

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <Link to="/careers" className="inline-flex items-center gap-1 text-sm font-medium text-mustard-600 hover:text-mustard-700">
        <ArrowLeft size={14} /> Back to open positions
      </Link>

      <Badge tone="mustard" >{job.department}</Badge>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">{job.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-fog-600">{job.description}</p>

      <div className="mt-6 rounded-xl border border-fog-200 bg-mustard-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-mustard-300 hover:shadow-lg">
        <h2 className="font-display font-semibold text-ink-900">What we're looking for</h2>
        <p className="mt-2 text-sm leading-relaxed text-fog-600">{job.requirements}</p>
      </div>

      <div className="mt-12 border-t border-fog-200 pt-10">
        {status === "done" ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-mustard-500/30 bg-mustard-500/10 px-6 py-12 text-center">
            <CheckCircle2 className="text-mustard-600" size={32} />
            <h2 className="font-display text-xl font-semibold text-ink-900">Application submitted. Good luck!</h2>
            <p className="max-w-sm text-sm text-fog-600">
              We'll review your application and reach out by email if it's a fit.
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl font-semibold text-ink-900">Apply for this role</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <TextInput
                label="Full name"
                id="applicantName"
                value={form.applicantName}
                onChange={handleChange("applicantName")}
                error={fieldErrors.applicantName}
                placeholder="Ahmad Raza"
              />
              <TextInput
                label="Email"
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                error={fieldErrors.email}
                placeholder="ahmad@example.com"
              />
              <TextArea
                label="Cover note (optional)"
                id="coverNote"
                rows={5}
                value={form.coverNote}
                onChange={handleChange("coverNote")}
                placeholder="A few sentences about why you're interested."
              />

              <div>
                <label htmlFor="resume" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Resume (PDF or Word, max 5MB)
                </label>
                <label
                  htmlFor="resume"
                  className={`flex cursor-pointer items-center gap-3 rounded-md border border-dashed px-4 py-4 text-sm text-fog-600 hover:border-mustard-400 ${
                    fieldErrors.resume ? "border-red-500" : "border-fog-200"
                  }`}
                >
                  <UploadCloud size={18} className="text-fog-400" />
                  {file ? file.name : "Click to choose a file"}
                </label>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <FieldError>{fieldErrors.resume}</FieldError>
              </div>

              {status === "error" && <ErrorBlock message={submitError} />}

              <PrimaryButton type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
                {status === "submitting" ? "Submitting…" : "Submit application"}
              </PrimaryButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
