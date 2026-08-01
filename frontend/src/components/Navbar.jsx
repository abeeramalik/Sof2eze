import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/team", label: "Team" },
  { to: "/blog", label: "Blog" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative py-1 text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-mustard-500 after:transition-all ${
      isActive ? "text-white after:w-full" : "text-white/60 after:w-0 hover:text-white hover:after:w-full"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-ink-700 bg-ink-950/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#0a0a0a" stroke="#d4a017" strokeWidth="1.5" />
            <path d="M9 21 L16 9 L23 21" fill="none" stroke="#d4a017" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="21" r="2.4" fill="#ffffff" />
          </svg>
          Sof2eze
        </NavLink>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/login"
            className="flex items-center gap-1 rounded-full border border-ink-700 px-4 py-1.5 text-sm font-medium text-white/70 transition-colors hover:border-mustard-500 hover:text-mustard-400"
          >
            Staff Login <ArrowUpRight size={14} />
          </NavLink>
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-700 bg-ink-950 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
              Staff Login
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
