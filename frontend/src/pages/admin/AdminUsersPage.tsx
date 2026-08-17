import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Download,
  MoreVertical,
  ShieldCheck,
  KeyRound,
  Ban,
  CheckCircle2,
  RefreshCw,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  getAdminUsers,
  blockAdminUser,
  unblockAdminUser,
  resetAdminUserPassword,
} from "@/features/admin/api/admin.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [collegeFilter, setCollegeFilter] = useState("ALL");
  const [selectedUserForReset, setSelectedUserForReset] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  const { data: usersRes, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: getAdminUsers,
    staleTime: 1000 * 15,
  });

  const users = useMemo(() => {
    return Array.isArray(usersRes?.data) ? usersRes.data : [];
  }, [usersRes]);

  // Mutations
  const blockMutation = useMutation({
    mutationFn: (userId: string) => blockAdminUser(userId),
    onSuccess: () => {
      toast.success("User deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setActiveActionMenu(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to deactivate user");
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (userId: string) => unblockAdminUser(userId),
    onSuccess: () => {
      toast.success("User activated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setActiveActionMenu(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to activate user");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password?: string }) =>
      resetAdminUserPassword(userId, password),
    onSuccess: () => {
      toast.success("Password reset successfully! Default: Password@123");
      setSelectedUserForReset(null);
      setNewPasswordInput("");
      setActiveActionMenu(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    },
  });

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      if (!u) return false;
      const firstName = String(u.firstName || "");
      const lastName = String(u.lastName || "");
      const email = String(u.email || "");
      const college = String(u.collegeName || "");
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        q === "" ||
        `${firstName} ${lastName}`.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        college.toLowerCase().includes(q);

      const role = String(u.role || "").toUpperCase();
      const matchesRole =
        roleFilter === "ALL" || role === roleFilter.toUpperCase();

      const status = String(u.status || "").toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter.toUpperCase();

      const matchesCollege =
        collegeFilter === "ALL" ||
        college.toLowerCase().includes(collegeFilter.toLowerCase());

      return matchesSearch && matchesRole && matchesStatus && matchesCollege;
    });
  }, [users, searchQuery, roleFilter, statusFilter, collegeFilter]);

  const handleExportCsv = () => {
    toast.info("Generating Users CSV export...");
    window.open("http://localhost:8080/api/v1/admin/reports/export/users", "_blank");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Users Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage all registered students, drivers, and platform personnel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ─── Error Alert ─── */}
      {isError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>Unable to load users directory. {(error as any)?.message || "Service unavailable."}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* ─── Filters & Search Bar ─── */}
      <Card className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none font-semibold"
            >
              <option value="ALL">All Roles</option>
              <option value="RIDER">Rider</option>
              <option value="DRIVER">Driver</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked / Inactive</option>
            </select>
          </div>

          {/* College Filter */}
          <div>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none font-semibold"
            >
              <option value="ALL">All Colleges</option>
              <option value="VRSEC">VRSEC Siddhartha</option>
              <option value="PVPSIT">PVPSIT Kanuru</option>
              <option value="KL">KL University</option>
              <option value="SRM">SRM University AP</option>
              <option value="VIT">VIT-AP University</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ─── Users Table ─── */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
            <span>Loading user directory...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No users found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Try adjusting your search or filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">College / Institution</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredUsers.map((u: any) => {
                  const joinedDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Aug 2026";

                  const isBlocked = u.status === "BLOCKED" || u.status === "INACTIVE";

                  return (
                    <tr key={u.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                            {u.firstName?.[0] || "U"}
                            {u.lastName?.[0] || ""}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* College */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            {u.collegeName || "Siddhartha Academy"}
                          </span>
                          {u.collegeVerified && (
                            <span title="Verified Student">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {u.role || "RIDER"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 w-fit ${
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
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-[11px]">
                        {joinedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/users/${u.id}`}
                            className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="View User Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveActionMenu(
                                  activeActionMenu === u.id ? null : u.id
                                )
                              }
                              className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {activeActionMenu === u.id && (
                              <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-lg text-left space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                                <Link
                                  to={`/admin/users/${u.id}`}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                >
                                  <Eye className="h-3.5 w-3.5 text-zinc-500" />
                                  <span>View Profile</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUserForReset(u);
                                    setActiveActionMenu(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                >
                                  <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Reset Password</span>
                                </button>

                                {isBlocked ? (
                                  <button
                                    type="button"
                                    onClick={() => unblockMutation.mutate(u.id)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Activate User</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => blockMutation.mutate(u.id)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                    <span>Deactivate User</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ─── Reset Password Modal ─── */}
      {selectedUserForReset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Reset Password for {selectedUserForReset.firstName}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Set a temporary password or leave blank to reset to default (
              <span className="font-mono font-bold">Password@123</span>).
            </p>
            <input
              type="text"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              placeholder="e.g. CampusMate@2026"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserForReset(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  resetPasswordMutation.mutate({
                    userId: selectedUserForReset.id,
                    password: newPasswordInput || "Password@123",
                  })
                }
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
