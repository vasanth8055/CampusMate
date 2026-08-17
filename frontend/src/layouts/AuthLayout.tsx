import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type AuthLayoutProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  backTo?: string;
  headerIcon?: ReactNode;
  topAccent?: boolean;
  maxWidthClass?: string;
  hideBrand?: boolean;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  showBack = false,
  onBack,
  backTo,
  headerIcon,
  topAccent = false,
  maxWidthClass = "max-w-lg",
  hideBrand = false,
}: AuthLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative selection:bg-indigo-100 selection:text-indigo-900">
      <div className={`w-full ${maxWidthClass} relative`}>
        {/* Card Container */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-border bg-surface p-6 sm:p-10 shadow-sm dark:shadow-medium">
          {topAccent && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600" />
          )}

          {/* Top Bar / Brand Header */}
          {!hideBrand && (
            <div className="relative mb-6 flex items-center justify-center">
              {showBack && (
                <button
                  type="button"
                  onClick={handleBack}
                  aria-label="Go back"
                  className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border border-indigo-100 dark:border-border text-foreground-secondary hover:bg-slate-50 dark:hover:bg-surface-elevated hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}

              <Link
                to="/"
                className="inline-flex items-center gap-2.5 text-2xl font-bold text-primary tracking-tight"
              >
                <img
                  src="/assets/campusmate-icon.png"
                  alt="CampusMate"
                  className="h-10 w-10 object-contain shrink-0"
                />
                <span>CampusMate</span>
              </Link>
            </div>
          )}

          {/* Optional Header Icon Badge */}
          {headerIcon && (
            <div className="mb-4 flex justify-center">{headerIcon}</div>
          )}

          {/* Title & Subtitle */}
          {title && (
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-foreground-secondary">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Body / Form */}
          {children}
        </div>
      </div>
    </div>
  );
}