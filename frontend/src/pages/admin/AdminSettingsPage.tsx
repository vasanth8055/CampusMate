import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { useAdminAuthStore } from "@/features/admin/store/adminAuth.store";
import { changeAdminPassword } from "@/features/admin/api/admin.api";
import { getAdminProfile } from "@/features/admin/api/adminAuth.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminSettingsPage() {
  const admin = useAdminAuthStore((s) => s.admin);

  const { data: profileRes } = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: getAdminProfile,
    staleTime: 1000 * 60 * 5,
  });

  const activeAdmin = profileRes?.data || admin;
  const adminFirstName = activeAdmin?.firstName || "Vasanth";
  const adminFullName = [activeAdmin?.firstName, activeAdmin?.lastName].filter(Boolean).join(" ") || "Vasanth";
  const adminEmail = activeAdmin?.email || "campusmate.teamofficial@gmail.com";
  const adminRole = activeAdmin?.role === "ADMIN" || activeAdmin?.role === "ADMINISTRATOR" ? "Administrator" : (activeAdmin?.role || "Administrator");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassMutation = useMutation({
    mutationFn: () =>
      changeAdminPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    onSuccess: () => {
      toast.success("Admin password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to update password. Verify current password."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    changePassMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Admin Profile & Security Settings
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Manage credentials, administrative privileges, and security settings for this console.
        </p>
      </div>

      {/* ─── Administrator Identity Card ─── */}
      <Card className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-lg">
            {adminFirstName[0] || "V"}
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {adminFullName}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold uppercase text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {adminRole}
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                {adminEmail}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-zinc-500 font-medium">Role Access Level:</span>
            <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Master Super Admin (Full Privileges)
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-zinc-500 font-medium">Session Status:</span>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Active & Authenticated
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Change Password Card ─── */}
      <Card className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Change Master Password
          </h2>
        </div>
        <p className="text-xs text-zinc-500">
          Ensure your account uses a strong password with letters, numbers, and special characters.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={changePassMutation.isPending}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-semibold"
            >
              {changePassMutation.isPending ? "Updating Password..." : "Save New Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
