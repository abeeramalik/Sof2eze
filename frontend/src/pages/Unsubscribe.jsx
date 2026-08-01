import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { backend } from "../api/backendClient";
import { useFetch } from "../hooks/useFetch";
import { LoadingBlock, PrimaryButton } from "../components/ui";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const fetcher = useCallback(() => backend.unsubscribeNewsletter(token), [token]);
  const { data, error, loading } = useFetch(fetcher, [token]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 py-16 text-center">
      {loading && <LoadingBlock label="Processing…" />}

      {!loading && data && (
        <>
          <CheckCircle2 className="text-mustard-600" size={36} />
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">You're unsubscribed</h1>
          <p className="mt-2 text-fog-600">{data.message || "You won't hear from us again unless you resubscribe."}</p>
        </>
      )}

      {!loading && error && (
        <>
          <XCircle className="text-red-500" size={36} />
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">Link not valid</h1>
          <p className="mt-2 text-fog-600">
            This unsubscribe link is invalid or has already been used.
          </p>
        </>
      )}

      <Link to="/" className="mt-6">
        <PrimaryButton>Back to home</PrimaryButton>
      </Link>
    </div>
  );
}
