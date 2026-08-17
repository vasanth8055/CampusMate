import { useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Home,
  GraduationCap,
  Car,
  ClipboardList,
  Bell,
  ArrowRight,
  Clock,
  ChevronRight,
  Navigation,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLocationStore } from "@/store/location.store";
import { getMyBookingsWithTrips } from "@/features/booking/api/booking.api";
import { getMyDriver } from "@/features/driver/api/driver.api";
import { getUnreadCount } from "@/features/notification/api/notification.api";
import { getCurrentUser } from "@/features/profile/api/profile.api";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { getStatusBadgeClass, getStatusLabel } from "@/utils/status";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { fetchCurrentLocation, syncFromUserProfile } = useLocationStore();

  // Load user profile & sync home location
  const { data: userProfileData } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    fetchCurrentLocation(false);
    if (userProfileData?.data) {
      syncFromUserProfile(userProfileData.data);
    }
  }, [fetchCurrentLocation, syncFromUserProfile, userProfileData]);

  // Load bookings with 5-second polling for real-time rider updates
  const { data: bookingTripPairs } = useQuery({
    queryKey: ["bookings", "me", "withTrips"],
    queryFn: getMyBookingsWithTrips,
    staleTime: 1000 * 5,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Load driver application status if any
  const { data: driverData } = useQuery({
    queryKey: ["driver", "me"],
    queryFn: getMyDriver,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const driver = driverData?.data;

  // Load unread notification count with 5-second polling
  const { data: unreadRes } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    staleTime: 1000 * 5,
    refetchInterval: 5000,
  });
  const unreadCount = unreadRes?.data?.count ?? 0;

  // Upcoming / active ride (Priority: 1. ONGOING, 2. ACCEPTED/CONFIRMED, 3. REQUESTED)
  const upcomingRide = useMemo(() => {
    const list = bookingTripPairs ?? [];
    const ongoing = list.find(({ booking }) => booking.status === "ONGOING");
    if (ongoing) return ongoing;

    const confirmed = list.find(
      ({ booking }) =>
        booking.status === "ACCEPTED" || booking.status === "CONFIRMED"
    );
    if (confirmed) return confirmed;

    const requested = list.find(({ booking }) => booking.status === "REQUESTED");
    return requested || null;
  }, [bookingTripPairs]);

  const firstName = user?.firstName || "Rider";

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-4xl space-y-5 animate-in fade-in duration-300">
      {/* ─── Top Header ─── */}
      <div className="flex items-center justify-between pt-1">
        {/* Mode Toggle */}
        <div className="flex items-center rounded-full bg-surface-subtle border border-border p-1 shadow-soft">
          <button
            type="button"
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-soft transition"
          >
            Rider
          </button>
          <button
            type="button"
            onClick={() =>
              navigate(
                driver?.status === "APPROVED" || user?.role === "DRIVER"
                  ? "/driver/dashboard"
                  : "/become-driver"
              )
            }
            className="rounded-full px-4 py-1.5 text-xs font-semibold text-foreground-secondary hover:text-foreground transition"
          >
            Driver
          </button>
        </div>

        {/* User Info & Notification */}
        <div className="flex items-center gap-3">
          <Link to="/profile" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle text-primary font-bold shadow-soft ring-2 ring-primary/20">
              {firstName[0]}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-primary">Good morning,</div>
              <div className="text-sm font-extrabold text-foreground tracking-tight">
                {firstName}
              </div>
            </div>
          </Link>

          {/* Rider Ready Pill */}
          <div className="hidden xs:flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Rider Ready</span>
          </div>

          {/* Alerts Bell */}
          <Link
            to="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white ring-2 ring-surface">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Greeting (if small screen) */}
      <div className="sm:hidden flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-primary">Good morning,</div>
          <div className="text-xl font-extrabold text-foreground tracking-tight">
            {firstName}
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Rider Ready</span>
        </div>
      </div>

      {/* ─── Search Bar (Where are you going?) ─── */}
      <div
        onClick={() => navigate("/find-rides")}
        className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4 shadow-soft hover:shadow-medium hover:border-primary/40 transition cursor-pointer group"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-soft group-hover:scale-105 transition">
          <Search className="h-5 w-5 stroke-[2.5]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-base text-foreground tracking-tight group-hover:text-primary transition">
            Where are you going?
          </div>
          <div className="text-xs text-foreground-secondary truncate mt-0.5">
            Search campus locations & verified routes
          </div>
        </div>
      </div>

      {/* ─── Shortcuts (Home ↔ College) ─── */}
      <div className="grid grid-cols-2 gap-3.5">
        <div
          onClick={() => navigate("/find-rides?shortcut=home-to-college")}
          className="flex flex-col justify-between p-4 rounded-2xl border border-border bg-surface shadow-soft hover:border-primary/50 hover:shadow-medium transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle text-primary">
              <Home className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-foreground-muted group-hover:text-primary group-hover:translate-x-0.5 transition" />
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-subtle text-secondary">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-extrabold text-xs text-foreground tracking-wider uppercase">
              HOME → COLLEGE
            </div>
            <div className="text-xs text-foreground-secondary mt-0.5 font-medium">
              Daily Commute
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate("/find-rides?shortcut=college-to-home")}
          className="flex flex-col justify-between p-4 rounded-2xl border border-border bg-surface shadow-soft hover:border-primary/50 hover:shadow-medium transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-subtle text-secondary">
              <GraduationCap className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-foreground-muted group-hover:text-primary group-hover:translate-x-0.5 transition" />
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle text-primary">
              <Home className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-extrabold text-xs text-foreground tracking-wider uppercase">
              COLLEGE → HOME
            </div>
            <div className="text-xs text-foreground-secondary mt-0.5 font-medium">
              Return Trip
            </div>
          </div>
        </div>
      </div>

      {/* ─── Server-Authoritative Upcoming / Active Ride Section ─── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            {upcomingRide?.booking.status === "ONGOING"
              ? "Active Ride"
              : upcomingRide
              ? "Upcoming Confirmed Ride"
              : "Upcoming Ride"}
          </h2>
          {upcomingRide && (
            <Link
              to="/bookings"
              className="text-xs font-semibold text-primary hover:underline"
            >
              See all
            </Link>
          )}
        </div>

        {upcomingRide ? (
          <div className="rounded-2xl border border-primary/30 bg-surface p-4 shadow-medium space-y-3.5">
            <div className="flex items-center justify-between">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${getStatusBadgeClass(
                  upcomingRide.booking.status
                )}`}
              >
                <Clock className="h-3 w-3" />
                <span>{getStatusLabel(upcomingRide.booking.status)}</span>
              </span>
              <span className="text-xs font-bold text-foreground">
                {formatDateTime(upcomingRide.trip?.departureTime)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0"></div>
                <div className="font-semibold text-foreground truncate">
                  {upcomingRide.trip?.source || "Pickup Point"}
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="mt-1 h-2 w-2 rounded-full bg-secondary shrink-0"></div>
                <div className="font-semibold text-foreground truncate">
                  {upcomingRide.trip?.destination || "College Campus"}
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex items-center justify-between">
              <div className="text-xs text-foreground-secondary">
                <div className="font-bold text-foreground">
                  {upcomingRide.trip?.driver
                    ? `${upcomingRide.trip.driver.firstName} ${upcomingRide.trip.driver.lastName}`
                    : "Campus Driver"}
                </div>
                <div className="text-[10px] text-foreground-muted">
                  {upcomingRide.trip?.vehicle
                    ? `${upcomingRide.trip.vehicle.brand} ${upcomingRide.trip.vehicle.model}`
                    : "Verified Vehicle"}{" "}
                  • {formatCurrency(upcomingRide.trip?.price || 40)}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    upcomingRide.booking.status === "ONGOING"
                      ? `/track/${upcomingRide.booking.tripId}`
                      : `/trips/${upcomingRide.booking.tripId}`
                  )
                }
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
              >
                {upcomingRide.booking.status === "ONGOING" ? (
                  <>
                    <Navigation className="h-3.5 w-3.5 animate-bounce" />
                    <span>Track Driver</span>
                  </>
                ) : (
                  <>
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-7 text-center shadow-soft space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-subtle/60 text-primary">
              <Car className="h-7 w-7" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">
                No upcoming rides
              </div>
              <p className="text-xs text-foreground-secondary mt-1 max-w-[220px]">
                Find a commute that works for you.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/find-rides")}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
            >
              Find Rides
            </button>
          </div>
        )}
      </div>

      {/* ─── Earn as a Driver Banner ─── */}
      <div className="flex items-center justify-between rounded-2xl bg-primary p-5 text-white shadow-medium">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white">
            <Car className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-sm tracking-tight truncate">
              Earn as a Driver
            </div>
            <div className="text-xs text-white/80 truncate mt-0.5">
              Join our campus driver community.
            </div>
          </div>
        </div>
        <Link
          to="/become-driver"
          className="shrink-0 ml-3 rounded-xl bg-white px-4 py-2 text-xs font-bold text-primary shadow-soft hover:bg-white/95 transition active:scale-95"
        >
          Apply Now
        </Link>
      </div>

      {/* ─── Driver Application Status (if exists) ─── */}
      {driver && driver.status !== "APPROVED" && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary-subtle/60 p-4 shadow-soft">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-foreground">
                Application under review
              </div>
              <div className="text-[11px] text-foreground-secondary truncate mt-0.5">
                We're checking your driver credentials.
              </div>
            </div>
          </div>
          <Link
            to="/become-driver"
            className="shrink-0 ml-3 rounded-xl border border-primary bg-surface px-3 py-1.5 text-xs font-bold text-primary shadow-soft hover:bg-surface-elevated transition"
          >
            Check Status
          </Link>
        </div>
      )}
    </div>
  );
}
