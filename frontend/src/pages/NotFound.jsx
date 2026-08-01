import { Link } from "react-router-dom";
import { PrimaryButton } from "../components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-mustard-600">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-fog-600">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="mt-6">
        <PrimaryButton>Back to home</PrimaryButton>
      </Link>
    </div>
  );
}
