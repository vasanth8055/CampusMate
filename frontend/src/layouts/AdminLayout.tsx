import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  UserCheck,
  Car,
  MapPin,
  Ticket,
  Activity,
  FileSpreadsheet,
  Bell,
  ShieldAlert,
  Settings,
  LogOut,
  Search,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { useAdminAuthStore } from "@/features/admin/store/adminAuth.store";
import { getAdminDashboard } from "@/features/admin/api/admin.api";
import { getAdminProfile } from "@/features/admin/api/adminAuth.api";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAdminAuthStore((s) => s.logout);
  const admin = useAdminAuthStore((s) => s.admin);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profileRes } = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: getAdminProfile,
    staleTime: 1000 * 60 * 5,
  });

  const { data: dashRes } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getAdminDashboard,
    staleTime: 1000 * 15,
    refetchInterval: 15000,
  });

  const pendingAppsCount = dashRes?.data?.pendingDrivers ?? 0;

  const handleLogout = () => {
    logout();
    toast.success("Logged out of CampusMate Admin Console");
    navigate("/admin/login", { replace: true });
  };

  const navItems = [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", to: "/admin/users", icon: Users },
    {
      label: "Driver Applications",
      to: "/admin/applications",
      icon: FileCheck,
      badge: pendingAppsCount,
    },
    { label: "Drivers", to: "/admin/drivers", icon: UserCheck },
    { label: "Vehicles", to: "/admin/vehicles", icon: Car },
    { label: "Trips", to: "/admin/trips", icon: MapPin },
    { label: "Bookings", to: "/admin/bookings", icon: Ticket },
    { label: "Active Rides", to: "/admin/active-rides", icon: Activity },
    { label: "Reports", to: "/admin/reports", icon: FileSpreadsheet },
    { label: "Notifications", to: "/admin/notifications", icon: Bell },
    { label: "System Health", to: "/admin/health", icon: ShieldAlert },
  ];

  // Resolve admin name & email dynamically from backend query or session store
  const activeAdmin = profileRes?.data || admin;
  const adminFirstName = activeAdmin?.firstName || "Vasanth";
  const adminFullName = [activeAdmin?.firstName, activeAdmin?.lastName].filter(Boolean).join(" ") || "Vasanth";
  const adminEmail = activeAdmin?.email || "campusmate.teamofficial@gmail.com";
  const adminRoleDisplay = activeAdmin?.role === "ADMIN" || activeAdmin?.role === "ADMINISTRATOR" ? "Administrator" : (activeAdmin?.role || "Administrator");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex font-sans">
      {/* ─── Left Sidebar (Clean Neutral Dark / White System) ─── */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 select-none z-30 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-3">
          <img
            src="/assets/campusmate-icon.png"
            alt="CampusMate"
            className="h-8 w-8 object-contain shrink-0"
          />
          <div>
            <div className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>CampusMate</span>
              <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 text-[9px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide border border-zinc-200 dark:border-zinc-700">
                Ops
              </span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              CONSOLE
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {navItems.map(({ label, to, icon: Icon, badge }) => {
            const isActive = location.pathname === to || (to !== "/admin/dashboard" && location.pathname.startsWith(to));
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? "text-white dark:text-zinc-900" : "text-zinc-400 dark:text-zinc-500"}`} />
                  <span>{label}</span>
                </div>
                {badge && badge > 0 ? (
                  <span
                    className={`flex h-4 min-w-4 px-1.5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-amber-400 text-zinc-900"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <NavLink
            to="/admin/settings"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              location.pathname === "/admin/settings"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Settings className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 flex items-center justify-between gap-4">
          {/* Global Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search systems, services, logs, trips..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-9 pr-4 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition"
            />
          </div>

          {/* Right Header Controls & Admin Identity */}
          <div className="flex items-center gap-3">
            {/* Live Monitoring Beacon */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE OPS</span>
            </div>

            <ThemeToggle />

            {/* Notification Bell */}
            <Link
              to="/admin/notifications"
              className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-xs"
            >
              <Bell className="h-4 w-4" />
              {pendingAppsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500"></span>
              )}
            </Link>

            {/* Admin Profile Display (Vasanth / Administrator) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 pr-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs">
                  {adminFirstName[0] || "V"}
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {adminFirstName}
                  </span>
                  <span className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 leading-tight">
                    {adminRoleDisplay}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 w-52 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-lg backdrop-blur-md z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {adminFullName}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {adminEmail}
                    </p>
                  </div>
                  <Link
                    to="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    <Settings className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport with Error Boundary */}
        <main className="flex-1 p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
