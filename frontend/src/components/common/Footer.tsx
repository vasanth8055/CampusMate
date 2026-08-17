import { Link } from "react-router-dom";

export default function Footer() {

  const links = [
    { label: "About", href: "#" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Safety", href: "#why-campusmate" },
    { label: "Contact", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
  ];

  return (
    <footer className="border-t border-slate-100 dark:border-border bg-surface py-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Brand & Copyright */}
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
              <img
                src="/assets/campusmate-icon.png"
                alt="CampusMate"
                className="h-8 w-8 object-contain shrink-0"
              />
              <span>CampusMate</span>
            </Link>
            <p className="text-xs text-foreground-muted">
              © {new Date().getFullYear()} CampusMate. All rights reserved.
            </p>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-foreground-secondary hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}