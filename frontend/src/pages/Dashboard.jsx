import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Download, Mail, FileText, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { backend } from "../api/backendClient";
import { useFetch } from "../hooks/useFetch";
import { LoadingBlock, ErrorBlock, StatusBadge, Badge, SecondaryButton } from "../components/ui";

// Mirrors the backend's statusMachine.js — the dashboard only ever offers
// transitions that are actually legal, so a user can't even attempt an
// invalid one through the UI. The backend still enforces this
// independently (guardrail #7) — this is just about not showing a button
// that would fail anyway.
const NEXT_STATUSES = {
  New: ["Reviewed", "Archived"],
  Reviewed: ["Archived"],
  Archived: ["Reviewed"],
};

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// ---- Review Notes Modal -------------------------------------------------

function ReviewNotesModal({ submission, nextStatus, onConfirm, onCancel, isUpdating }) {
  const [notes, setNotes] = useState("");

  const statusLabel = nextStatus === "Reviewed" ? "Review" : "Archive";
  const reopenLabel = nextStatus === "Reviewed" && submission.status === "Archived" ? "Reopen" : null;
  const buttonLabel = reopenLabel || `Mark as ${nextStatus}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-xl border border-fog-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            {reopenLabel || `${statusLabel} submission`}
          </h2>
          <button onClick={onCancel} className="text-fog-400 hover:text-ink-900">
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-fog-600">
          <p>
            <span className="font-medium text-ink-900">From:</span>{" "}
            {submission.name || submission.applicantName}
          </p>
          <p>
            <span className="font-medium text-ink-900">Email:</span> {submission.email}
          </p>
          {submission.subject && (
            <p>
              <span className="font-medium text-ink-900">Subject:</span> {submission.subject}
            </p>
          )}
        </div>

        <div className="mt-5">
          <label
            htmlFor="reviewNotes"
            className="mb-1.5 block text-sm font-medium text-ink-900"
          >
            Notes to include in the email to the submitter
          </label>
          <textarea
            id="reviewNotes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any feedback or notes here…"
            className="w-full rounded-md border border-fog-200 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-fog-400 focus:border-mustard-500"
          />
          <p className="mt-1 text-xs text-fog-400">
            The submitter will receive an email notification with these notes.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-fog-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-fog-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(notes)}
            disabled={isUpdating}
            className="rounded-md bg-ink-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-mustard-500 hover:text-ink-950 disabled:opacity-60"
          >
            {isUpdating ? "Updating…" : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Dashboard page ------------------------------------------------------

export default function Dashboard() {
  const { user, accessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState("");

  // Modal state
  const [modalSubmission, setModalSubmission] = useState(null);
  const [modalNextStatus, setModalNextStatus] = useState(null);

  const fetcher = useCallback(
    () => backend.listSubmissions(accessToken, statusFilter || undefined),
    [accessToken, statusFilter]
  );
  const { data, error, loading, refetch } = useDashboardData(fetcher);

  const isAdmin = user?.role === "Admin";

  function openModal(submission, nextStatus) {
    setModalSubmission(submission);
    setModalNextStatus(nextStatus);
  }

  function closeModal() {
    setModalSubmission(null);
    setModalNextStatus(null);
  }

  async function handleStatusChange(reviewNotes) {
    const submission = modalSubmission;
    const nextStatus = modalNextStatus;
    if (!submission || !nextStatus) return;

    setActionError("");
    setUpdatingId(submission.id);
    closeModal();

    try {
      await backend.updateSubmissionStatus(accessToken, submission.kind, submission.id, nextStatus, reviewNotes);
      await refetch();
    } catch (err) {
      setActionError(err.message || "Couldn't update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-ink-950 px-6 py-5 shadow-md">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Submissions dashboard</h1>
          <p className="mt-1 text-sm text-white/80">
            Signed in as <span className="font-medium text-white">{user?.email}</span>{" "}
            <Badge tone={isAdmin ? "mustard-dark" : "fog"}>{user?.role}</Badge>
            {!isAdmin && <span className="ml-2 text-xs text-white/70">(view-only)</span>}
          </p>
        </div>
        <SecondaryButton className="border-white/30 bg-white/10 text-white hover:border-mustard-400 hover:text-mustard-300" onClick={handleLogout}>
          <LogOut size={16} /> Log out
        </SecondaryButton>
      </div>

      {loading && <LoadingBlock label="Loading submissions…" />}
      {error && <ErrorBlock message="We couldn't load submissions. Try logging in again." />}

      {data && (
        <>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: "New", value: data.counts.new },
              { label: "Reviewed", value: data.counts.reviewed },
              { label: "Archived", value: data.counts.archived },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-ink-700 bg-ink-950 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-mustard-400 hover:shadow-lg">
                <p className="text-sm text-fog-400">{c.label}</p>
                <p className="mt-1 font-display text-3xl font-semibold text-white">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2">
            <span className="text-sm text-fog-600">Filter:</span>
            {["", "New", "Reviewed", "Archived"].map((s) => (
              <button
                key={s || "all"}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-ink-950 text-white" : "bg-fog-100 text-fog-600 hover:bg-fog-200"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>

          {actionError && <div className="mt-4"><ErrorBlock message={actionError} /></div>}

          <div className="mt-6 overflow-hidden rounded-xl border border-fog-200 transition-shadow duration-300 hover:shadow-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-950 text-xs uppercase tracking-wide text-white">
                <tr className="divide-x divide-ink-700">
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.submissions.map((s) => (
                  <tr key={s.id} className="divide-x divide-fog-200">
                    <td className="px-4 py-3 odd:bg-mustard-50 even:bg-mustard-300/30">
                      <span className="inline-flex items-center gap-1.5 text-fog-600">
                        {s.kind === "application" ? <FileText size={14} /> : <Mail size={14} />}
                        {s.kind === "application" ? "Application" : "Contact"}
                      </span>
                    </td>
                    <td className="px-4 py-3 odd:bg-mustard-50 even:bg-mustard-300/30">
                      <div className="font-medium text-ink-900">{s.name || s.applicantName}</div>
                      <div className="text-xs text-fog-600">{s.email}</div>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-fog-600 odd:bg-mustard-50 even:bg-mustard-300/30">
                      {s.kind === "contact" ? (
                        <>
                          <div className="font-medium text-ink-900">{s.subject}</div>
                          <div className="line-clamp-1">{s.message}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-fog-400">Job: {s.jobListingId}</div>
                          {s.resumeUrl && (
                            <a
                              href={backend.resumeDownloadUrl(s.id)}
                              className="mt-1 inline-flex items-center gap-1 text-mustard-600 hover:text-mustard-700"
                              onClick={(e) => handleResumeDownload(e, accessToken, s.id)}
                            >
                              <Download size={12} /> Resume
                            </a>
                          )}
                        </>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-fog-600 odd:bg-mustard-50 even:bg-mustard-300/30">{formatDate(s.createdAt)}</td>
                    <td className="px-4 py-3 odd:bg-mustard-50 even:bg-mustard-300/30"><StatusBadge status={s.status} /></td>
                    {isAdmin && (
                      <td className="px-4 py-3 odd:bg-mustard-50 even:bg-mustard-300/30">
                        <div className="flex flex-wrap gap-1.5">
                          {NEXT_STATUSES[s.status].map((next) => (
                            <button
                              key={next}
                              disabled={updatingId === s.id}
                              onClick={() => openModal(s, next)}
                              className="rounded-md border border-fog-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:border-mustard-400 hover:text-mustard-600 disabled:opacity-50"
                            >
                              {next === "Reviewed" && s.status === "Archived" ? "Reopen" : `Mark ${next}`}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {data.submissions.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-4 py-10 text-center text-fog-400">
                      No submissions{statusFilter ? ` with status "${statusFilter}"` : ""} yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Review Notes Modal */}
      {modalSubmission && modalNextStatus && (
        <ReviewNotesModal
          submission={modalSubmission}
          nextStatus={modalNextStatus}
          onConfirm={handleStatusChange}
          onCancel={closeModal}
          isUpdating={updatingId === modalSubmission.id}
        />
      )}
    </div>
  );
}

// Secure resume download (FR21): fetch with the Authorization header
// (plain <a href> can't send one), then hand the browser a blob URL.
async function handleResumeDownload(e, accessToken, applicationId) {
  e.preventDefault();
  const res = await fetch(backend.resumeDownloadUrl(applicationId), {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume";
  a.click();
  URL.revokeObjectURL(url);
}

// Small wrapper around useFetch that also exposes a manual refetch, used
// after a status change so the table updates without a full page reload.
function useDashboardData(fetcher) {
  const [tick, setTick] = useState(0);
  const wrappedFetcher = useCallback(() => fetcher(), [fetcher, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const result = useFetch(wrappedFetcher, [wrappedFetcher]);
  return { ...result, refetch: () => setTick((t) => t + 1) };
}
