import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Mail, Lock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { adminLogin } from "@/features/admin/api/adminAuth.api";
import { useAdminAuthStore } from "@/features/admin/store/adminAuth.store";
import { PasswordInput } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const adminLoginStore = useAdminAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: { email: string; password: string }) => adminLogin(payload),
    onSuccess: (res) => {
      if (res && res.data) {
        adminLoginStore({
          admin: {
            email: res.data.email,
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            role: res.data.role,
          },
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken ?? "",
        });

        toast.success("Admin logged in successfully");
        navigate("/admin/dashboard");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err?.response?.data?.message ?? "Invalid admin credentials";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-background flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Main Ops Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-border bg-surface shadow-xs">
          {/* Top Section */}
          <div className="p-8 pb-6 border-b border-slate-100 dark:border-border">
            {/* Brand */}
            <div className="flex items-center gap-2.5 text-foreground font-bold text-lg tracking-tight">
              <img
                src="/assets/campusmate-icon.png"
                alt="CampusMate"
                className="h-8 w-8 object-contain shrink-0"
              />
              <span>CampusMate Ops</span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
              Operations Console
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
              Manage CampusMate users, drivers, trips and platform operations.
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Admin Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-foreground-secondary uppercase">
                  ADMIN EMAIL
                </label>
                <div className="relative flex items-center rounded-lg border border-slate-200 dark:border-border bg-surface px-3 py-2 focus-within:border-black dark:focus-within:border-white transition-colors">
                  <Mail className="h-4 w-4 text-foreground-muted mr-2.5 shrink-0" />
                  <input
                    type="email"
                    placeholder="campusmate.teamofficial@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-foreground-secondary uppercase">
                  PASSWORD
                </label>
                <PasswordInput
                  prefixIcon={<Lock className="h-4 w-4" />}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  wrapperClassName="rounded-lg border-slate-200 dark:border-border focus-within:border-black dark:focus-within:border-white"
                />
                <div className="text-right pt-0.5">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full rounded-lg bg-black dark:bg-white text-white dark:text-black py-3 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 shadow-xs"
                >
                  {mutation.isPending ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Notice Panel */}
          <div className="bg-slate-50/80 dark:bg-surface-elevated/50 p-6 border-t border-slate-100 dark:border-border">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-foreground-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold tracking-wide text-foreground uppercase">
                  AUTHORIZED OPERATIONS ONLY
                </p>
                <p className="text-[11px] text-foreground-secondary leading-relaxed mt-1">
                  Access restricted to authorized CampusMate operations personnel. All
                  activities on this portal are logged and monitored for security
                  purposes.
                </p>
              </div>
            </div>

            {/* Status Footer */}
            <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-border flex items-center justify-between text-[11px] text-foreground-muted">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>System Status: Operational</span>
              </div>
              <a
                href="mailto:support@campusmate.com"
                className="hover:text-foreground transition-colors"
              >
                IT Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


