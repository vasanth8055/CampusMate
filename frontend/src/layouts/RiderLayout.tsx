import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  Search,
  Car,
  Bell,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { logout } from "@/features/auth/api/auth.api";
import { getMyDriver } from "@/features/driver/api/driver.api";
import { getUnreadCount } from "@/features/notification/api/notification.api";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useNotificationWatcher } from "@/hooks/useNotificationWatcher";

export default function RiderLayout() {
  useNotificationWatcher();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const { data: unreadRes } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    staleTime: 1000 * 5,
    refetchInterval: 5000,
  });
  const unreadCount = unreadRes?.data?.count ?? 0;

  const { data: driverRes } = useQuery({
    queryKey: ["driver", "me"],
    queryFn: getMyDriver,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });
  const driver = driverRes?.data;
  const isApprovedDriver = driver?.status === "APPROVED" || user?.role === "DRIVER";

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    useAuthStore.getState().logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login", { replace: true });
  };

  const handleModeSwitch = (targetMode: "RIDER" | "DRIVER") => {
    if (targetMode === "DRIVER") {
      if (isApprovedDriver) {
        toast.success("Driver mode enabled");
        navigate("/driver/dashboard");
      } else if (driver?.status === "PENDING" || driver?.status === "LICENSE_UPLOADED" || driver?.status === "UNDER_REVIEW") {
        toast.info("Your driver application is under review.");
        navigate("/become-driver");
      } else {
        toast.info("Driver access requires approval. Complete your application to offer rides.");
        navigate("/become-driver");
      }
    }
  };

  const navItems = [
    { label: "Home", to: "/dashboard", icon: Home },
    { label: "Find", to: "/find-rides", icon: Search },
    { label: "My Rides", to: "/bookings", icon: Car },
    { label: "Alerts", to: "/notifications", icon: Bell, badge: unreadCount },
    { label: "Profile", to: "/profile", icon: User },
  ];

  const sidebarLinks = [
    { label: "Dashboard", to: "/dashboard", icon: Home },
    { label: "Find Commute", to: "/find-rides", icon: Search },
    { label: "My Rides", to: "/bookings", icon: Car },
    { label: "Trip History", to: "/history", icon: Sparkles },
    { label: "Alerts", to: "/notifications", icon: Bell, badge: unreadCount },
    { label: "Profile", to: "/profile", icon: User },
    { label: "Become Driver", to: "/become-driver", icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ─── Desktop Top Header ─── */}
      <header className="sticky top-0 z-30 hidden lg:block border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Logo & Mode Switch Pill */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <img
                src="/assets/campusmate-icon.png"
                alt="CampusMate"
                className="h-9 w-9 object-contain shrink-0"
              />
              <span className="text-lg font-black tracking-tight text-foreground">
                Campus<span className="text-primary">Mate</span>
              </span>
            </Link>

            {/* Rider / Driver Toggle Pill (Stitch UI #6) */}
            <div className="flex items-center rounded-full bg-surface-subtle p-1 border border-border text-xs font-extrabold shadow-inner">
              <button
                type="button"
                className="rounded-full bg-primary px-3.5 py-1 text-white shadow-soft transition"
              >
                Rider
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch("DRIVER")}
                className="rounded-full px-3.5 py-1 text-foreground-secondary hover:text-foreground transition"
              >
                Driver
              </button>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="flex items-center gap-1">
            {sidebarLinks.map(({ label, to, icon: Icon, badge }) => {
              const isActive = location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-primary-subtle text-primary shadow-soft"
                      : "text-foreground-secondary hover:bg-surface-subtle hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {badge && badge > 0 ? (
                    <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-danger text-[9px] font-extrabold text-white">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-border bg-surface p-1 pr-3 hover:bg-surface-subtle transition shadow-soft"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-subtle text-primary font-bold text-xs">
                  {user?.firstName?.[0] || "R"}
                </div>
                <span className="text-xs font-bold text-foreground">
                  {user?.firstName || "Rider"}
                </span>
                <ChevronRight className="h-3 w-3 text-foreground-secondary" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-11 w-48 rounded-2xl border border-border bg-surface p-2 shadow-premium backdrop-blur-md z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-subtle transition"
                  >
                    <User className="h-4 w-4 text-primary" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/become-driver"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-subtle transition"
                  >
                    <Car className="h-4 w-4 text-primary" />
                    <span>Become a Driver</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-danger hover:bg-danger-subtle transition text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Header with Mode Toggle ─── */}
      <header className="sticky top-0 z-30 lg:hidden border-b border-border bg-surface/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src="/assets/campusmate-icon.png"
            alt="CampusMate"
            className="h-8 w-8 object-contain shrink-0"
          />
          <span className="text-base font-black tracking-tight text-foreground">
            Campus<span className="text-primary">Mate</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-surface-subtle p-0.5 border border-border text-[11px] font-extrabold">
            <button
              type="button"
              className="rounded-full bg-primary px-2.5 py-0.5 text-white shadow-soft"
            >
              Rider
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("DRIVER")}
              className="rounded-full px-2.5 py-0.5 text-foreground-secondary hover:text-foreground"
            >
              Driver
            </button>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* ─── Main Content Container ─── */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6">
        <Outlet />
      </main>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden border-t border-border bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ label, to, icon: Icon, badge }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`relative flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition ${
                  isActive
                    ? "text-primary"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                  {badge && badge > 0 ? (
                    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[10px] ${isActive ? "font-extrabold text-primary" : "font-medium"}`}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
