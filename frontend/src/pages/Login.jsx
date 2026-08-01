import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PrimaryButton, TextInput, ErrorBlock } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // UC-5: same generic message whether the email or password was
      // wrong — the backend already collapses this, we don't re-expose
      // detail here either.
      setError(err.message || "Invalid email or password.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-ink-950 text-mustard-400">
          <LogIn size={20} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">Staff Login</h1>
        <p className="mt-1 text-sm text-fog-600">For Sof2eze admin and staff only.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <TextInput
          label="Email"
          id="login-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ahmad@sof2eze.test"
        />
        <TextInput
          label="Password"
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {status === "error" && <ErrorBlock message={error} />}

        <PrimaryButton type="submit" disabled={status === "submitting"} className="w-full">
          {status === "submitting" ? "Signing in…" : "Sign in"}
        </PrimaryButton>
      </form>
    </div>
  );
}
