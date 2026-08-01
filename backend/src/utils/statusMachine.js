// Enforces the Submission / Application Status Lifecycle from the SRS (section 5.2):
//
//   New -> Reviewed
//   Reviewed -> Archived
//   New -> Archived            (direct fast path, e.g. spam/duplicates)
//   Archived -> Reviewed       (reopen — the ONLY transition out of Archived)
//
// Any transition not listed here is invalid and must be rejected by the API,
// not just discouraged in the UI. This is the single source of truth for
// which status changes are legal — routes must call `assertValidTransition`
// rather than re-implementing this logic inline.

export const STATUSES = ["New", "Reviewed", "Archived"];

const ALLOWED_TRANSITIONS = {
  New: ["Reviewed", "Archived"],
  Reviewed: ["Archived"],
  Archived: ["Reviewed"],
};

export class InvalidTransitionError extends Error {
  constructor(from, to) {
    super(`Cannot transition status from "${from}" to "${to}".`);
    this.name = "InvalidTransitionError";
    this.statusCode = 422;
  }
}

export function assertValidTransition(currentStatus, nextStatus) {
  if (!STATUSES.includes(nextStatus)) {
    throw new InvalidTransitionError(currentStatus, nextStatus);
  }
  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new InvalidTransitionError(currentStatus, nextStatus);
  }
}
