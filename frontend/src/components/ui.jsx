import { Loader2, AlertTriangle } from "lucide-react";
import Reveal from "./Reveal";

export function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="border-b border-ink-700 bg-ink-950">
      <Reveal direction="down" className="mx-auto max-w-6xl px-5 py-16">
        {eyebrow && (
          <div className="flex items-center gap-3">
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-mustard-400">
              {eyebrow}
            </p>
            <span className="rule-mustard" />
          </div>
        )}
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold text-white sm:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-4 max-w-xl text-lg text-fog-400">{description}</p>}
      </Reveal>
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-fog-600">
      <Loader2 className="animate-spin" size={18} />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBlock({ message = "Something went wrong. Please try again." }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-lg border border-red-500/30 bg-red-50 px-6 py-10 text-center text-red-500">
      <AlertTriangle size={22} />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function Badge({ children, tone = "mustard" }) {
  const tones = {
    mustard: "bg-mustard-500/10 text-mustard-600 border-mustard-500/30",
    "mustard-dark": "bg-mustard-600 text-white border-mustard-600",
    ink: "bg-ink-900 text-white border-ink-700",
    fog: "bg-fog-100 text-fog-600 border-fog-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const tones = { New: "mustard", Reviewed: "mustard-dark", Archived: "fog" };
  return <Badge tone={tones[status] || "fog"}>{status}</Badge>;
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mustard-500 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-ink-700 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:border-mustard-500 hover:text-mustard-600 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs font-medium text-red-500">{children}</p>;
}

export function TextInput({ label, id, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-900">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-md border px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-fog-400 focus:border-mustard-500 ${
          error ? "border-red-500" : "border-fog-200"
        }`}
        {...props}
      />
      <FieldError>{error}</FieldError>
    </div>
  );
}

export function TextArea({ label, id, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-900">
        {label}
      </label>
      <textarea
        id={id}
        className={`w-full rounded-md border px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-fog-400 focus:border-mustard-500 ${
          error ? "border-red-500" : "border-fog-200"
        }`}
        {...props}
      />
      <FieldError>{error}</FieldError>
    </div>
  );
}