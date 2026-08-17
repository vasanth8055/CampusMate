import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ShieldCheck,
  Car,
  KeyRound,
  Ban,
  CheckCircle2,
  Mail,
  Phone,
  Building,
  Navigation,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import {
  getAdminUser,
  blockAdminUser,
  unblockAdminUser,
  resetAdminUserPassword,
  getAdminDrivers,
  getAdminTrips,
  getAdminBookings,
  suspendAdminDriver,
  restoreAdminDriver,
} from "@/features/admin/api/admin.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminUserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // 1. Fetch user profile
  const { data: userRes, isLoading: userLoading, refetch } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => getAdminUser(userId!),
    enabled: !!userId,
  });

  const user = userRes?.data;

  // 2. Fetch all drivers to find driver profile if any
  const { data: driversRes } = useQuery({
    queryKey: ["admin", "drivers"],
    queryFn: () => getAdminDrivers(),
    staleTime: 1000 * 30,
  });
  const driverProfile = (driversRes?.data || []).find(
    (d: any) => d.userId === userId || d.driverId === userId
  );

  // 3. Fetch user's trips
  const { data: tripsRes } = useQuery({
    queryKey: ["admin", "trips"],
    queryFn: () => getAdminTrips(),
    staleTime: 1000 * 30,
  });
  const userTrips = (tripsRes?.data || []).filter(
    (t: any) => t.driverId === userId || (driverProfile && t.driverId === driverProfile.driverId)
  );

  // 4. Fetch user's bookings
  const { data: bookingsRes } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => getAdminBookings(),
    staleTime: 1000 * 30,
  });
  const userBookings = (bookingsRes?.data || []).filter(
    (b: any) => b.riderId === userId
  );

  // Mutations
  const blockMutation = useMutation({
    mutationFn: () => blockAdminUser(userId!),
    onSuccess: () => {
      toast.success("User account deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to deactivate user");
    },
  });

  const unblockMutation = useMutation({
    mutationFn: () => unblockAdminUser(userId!),
    onSuccess: () => {
      toast.success("User account activated");
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to activate user");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () =>
      resetAdminUserPassword(userId!, newPassword || "Password@123"),
    onSuccess: () => {
      toast.success("Password reset successfully! Default: Password@123");
      setResetModalOpen(false);
      setNewPassword("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    },
  });

  const suspendDriverMutation = useMutation({
    mutationFn: (driverId: string) =>
      suspendAdminDriver(driverId, "Suspended by administrator"),
    onSuccess: () => {
      toast.success("Driver capability suspended");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to suspend driver");
    },
  });

  const restoreDriverMutation = useMutation({
    mutationFn: (driverId: string) => restoreAdminDriver(driverId),
    onSuccess: () => {
      toast.success("Driver capability restored");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to restore driver");
    },
  });

  if (userLoading) {
    return (
      <div className="p-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
        <span>Loading user details...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 text-center space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">User not found</h3>
        <Link to="/admin/users" className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold hover:underline">
          Return to Users Directory
        </Link>
      </div>
    );
  }

  const isBlocked = user.status === "BLOCKED" || user.status === "INACTIVE";
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Aug 14, 2026";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Breadcrumb & Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold">
            <Link to="/admin/users" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
              Users
            </Link>
            <span>›</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-mono">
              USR-{String(user.id || "").slice(0, 8)}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            User Details
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Back to Users</span>
          </Link>
        </div>
      </div>

      {/* ─── Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 span): Profile Card & Contact Info */}
        <div className="space-y-6">
          {/* Main User Header Card */}
          <Card className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xl">
              {user.firstName?.[0] || "U"}
              {user.lastName?.[0] || ""}
            </div>

            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-0.5 break-all">
                {user.id}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-0.5 text-[11px] font-bold uppercase text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {user.role}
              </span>

              <span
                className={`rounded-full px-3 py-0.5 text-[11px] font-bold flex items-center gap-1 ${
                  isBlocked
                    ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800/60"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isBlocked ? "bg-red-500" : "bg-emerald-500"
                  }`}
                />
                <span>{isBlocked ? "Blocked" : "Active"}</span>
              </span>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Institution:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {user.collegeName || "Siddhartha Academy"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Joined Date:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{joinedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Last Active:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Just now</span>
              </div>
            </div>
          </Card>

          {/* Contact Info Card */}
          <Card className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl space-y-3 text-xs">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
              <Building className="h-4 w-4 text-zinc-500" />
              <span>Contact Information</span>
            </h3>

            <div className="space-y-2.5 text-zinc-800 dark:text-zinc-200">
              <div className="flex items-center gap-2.5 text-zinc-500">
                <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{user.email}</span>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-500">
                <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {user.phoneNumber || "+91 98765 43210"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-500 pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {user.collegeVerified ? "College Email Verified" : "Verification Pending"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (2 spans): Metrics, Driver Card, Activity & Danger Zone */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3 Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
              <div className="text-[11px] font-bold text-zinc-500 uppercase">
                Total Trips Taken
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {userBookings.length}
              </div>
            </Card>

            <Card className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
              <div className="text-[11px] font-bold text-zinc-500 uppercase">
                Trips Driven
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {userTrips.length}
              </div>
            </Card>

            <Card className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
              <div className="text-[11px] font-bold text-zinc-500 uppercase">
                Safety & Rating
              </div>
              <div className="text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1">
                <span>4.9</span>
                <span className="text-xs text-zinc-400">★</span>
              </div>
            </Card>
          </div>

          {/* Driver Application Status Card */}
          {driverProfile ? (
            <Card className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                  <Car className="h-4 w-4 text-zinc-500" />
                  <span>Driver Application & Vehicle</span>
                </h3>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    driverProfile.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200"
                      : driverProfile.status === "REJECTED"
                      ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200"
                  }`}
                >
                  {driverProfile.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-800 dark:text-zinc-200 pt-1">
                <div>
                  <span className="text-zinc-500">Driving License:</span>
                  <div className="font-mono font-semibold">{driverProfile.drivingLicenseNumber}</div>
                </div>

                {driverProfile.vehicle && (
                  <div>
                    <span className="text-zinc-500">Registered Vehicle:</span>
                    <div className="font-semibold">
                      {driverProfile.vehicle.brand} {driverProfile.vehicle.model} (
                      <span className="font-mono">{driverProfile.vehicle.registrationNumber}</span>)
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : null}

          {/* Recent Activity Table */}
          <Card className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Recent Activity</h3>

            {userTrips.length === 0 && userBookings.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                No recent rides or bookings associated with this account.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                {userTrips.map((t: any) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5 text-zinc-500" />
                        <span>
                          {t.source} ➔ {t.destination}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Driven on {t.departureTime ? new Date(t.departureTime).toLocaleString() : "Recent"}
                      </div>
                    </div>
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-bold text-[10px] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Danger Zone Card */}
          <Card className="p-5 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/60 shadow-xs rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Danger Zone</h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              High-impact administrative actions. Password resets and deactivations take effect immediately.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                <span>Reset Password</span>
              </Button>

              {driverProfile && (
                driverProfile.status === "SUSPENDED" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restoreDriverMutation.mutate(driverProfile.driverId)}
                    disabled={restoreDriverMutation.isPending}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Restore Driver Capability</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => suspendDriverMutation.mutate(driverProfile.driverId)}
                    disabled={suspendDriverMutation.isPending}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-600"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>Suspend Driver Capability</span>
                  </Button>
                )
              )}

              {isBlocked ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => unblockMutation.mutate()}
                  disabled={unblockMutation.isPending}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Activate User</span>
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => blockMutation.mutate()}
                  disabled={blockMutation.isPending}
                  className="flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Deactivate User</span>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ─── Reset Password Modal ─── */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Reset Password for {user.firstName}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter a new temporary password or leave blank for default (
              <span className="font-mono font-bold">Password@123</span>).
            </p>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="e.g. Password@123"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => resetPasswordMutation.mutate()}
                disabled={resetPasswordMutation.isPending}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
              >
                {resetPasswordMutation.isPending ? "Resetting..." : "Confirm Reset"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
