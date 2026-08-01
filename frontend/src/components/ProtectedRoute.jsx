import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingBlock } from "./ui";

// FR16: any internal/admin area requires auth. This is the frontend half of
// that rule — the backend enforces it independently via requireAuth, since
// a client-side gate alone is never a real security boundary.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <LoadingBlock label="Checking your session…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
