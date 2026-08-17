import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-slate-100 dark:border-border transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-2xl font-bold text-primary tracking-tight">
          <img
            src="/assets/campusmate-icon.png"
            alt="CampusMate"
            className="h-10 w-10 object-contain shrink-0"
          />
          <span>CampusMate</span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-foreground-secondary hover:text-primary transition-colors"
          >
            How It Works
          </a>
          <a
            href="#why-campusmate"
            className="text-sm font-medium text-foreground-secondary hover:text-primary transition-colors"
          >
            Safety
          </a>
          <Link
            to="/register"
            className="text-sm font-medium text-foreground-secondary hover:text-primary transition-colors"
          >
            Rider
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium text-foreground-secondary hover:text-primary transition-colors"
          >
            Driver
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          <Link
            to="/login"
            className="rounded-full px-5 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-slate-100 dark:hover:bg-surface-elevated border border-slate-200 dark:border-border transition-colors"
          >
            Log In
          </Link>

          <Link
            to="/register"
            className="rounded-full px-6 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow transition-all"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="p-2 text-foreground-secondary hover:text-foreground rounded-lg"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface px-6 py-4 md:hidden flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-foreground-secondary hover:text-primary py-2"
          >
            How It Works
          </a>
          <a
            href="#why-campusmate"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-foreground-secondary hover:text-primary py-2"
          >
            Safety
          </a>
          <Link
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-foreground-secondary hover:text-primary py-2"
          >
            Rider
          </Link>
          <Link
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-foreground-secondary hover:text-primary py-2"
          >
            Driver
          </Link>
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center rounded-full py-2.5 text-sm font-medium border border-border text-foreground"
            >
              Log In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center rounded-full py-2.5 text-sm font-semibold bg-primary text-primary-foreground"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}