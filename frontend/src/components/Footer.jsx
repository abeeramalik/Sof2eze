import { useState } from "react";
import { Link } from "react-router-dom";
import { backend } from "../api/backendClient";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubscribe(e) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await backend.subscribeNewsletter(email);
      setMessage(res.message);
      setStatus("done");
      setEmail("");
    } catch (err) {
      setMessage(err.message);
      setStatus("error");
    }
  }

  return (
    <footer className="border-t border-ink-700 bg-ink-950 text-white/70">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-white">
              <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
                <rect width="32" height="32" rx="7" fill="#0a0a0a" stroke="#d4a017" strokeWidth="1.5" />
                <path d="M9 21 L16 9 L23 21" fill="none" stroke="#d4a017" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="21" r="2.4" fill="#ffffff" />
              </svg>
              Sof2eze
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/50">
              Software built by people who maintain it too.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white">Company</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-mustard-400">About</Link></li>
              <li><Link to="/team" className="hover:text-mustard-400">Team</Link></li>
              <li><Link to="/careers" className="hover:text-mustard-400">Careers</Link></li>
              <li><Link to="/blog" className="hover:text-mustard-400">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white">Work with us</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/services" className="hover:text-mustard-400">Services</Link></li>
              <li><Link to="/portfolio" className="hover:text-mustard-400">Portfolio</Link></li>
              <li><Link to="/contact" className="hover:text-mustard-400">Contact</Link></li>
              <li><Link to="/login" className="hover:text-mustard-400">Staff Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white">Stay updated</h3>
            <p className="mt-3 text-sm text-white/50">Occasional notes on what we're building. No spam.</p>
            <form onSubmit={handleSubscribe} className="mt-3 flex gap-2">
              <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
              <input
                id="footer-newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmad@example.com"
                className="w-full rounded-md border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-mustard-500"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 rounded-md bg-mustard-500 px-3 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-mustard-400 disabled:opacity-60"
              >
                Subscribe
              </button>
            </form>
            {message && (
              <p className={`mt-2 text-xs ${status === "error" ? "text-red-400" : "text-mustard-400"}`}>{message}</p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-ink-700 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sof2eze. All rights reserved.</p>
          <p>Built with React, Tailwind, Node.js/Express, and a headless CMS.</p>
        </div>
      </div>
    </footer>
  );
}
