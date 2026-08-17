import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  GraduationCap,
  Lock,
  Car,
  LogOut,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLocationStore } from "@/store/location.store";
import { logout } from "@/features/auth/api/auth.api";
import {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
} from "@/features/profile/api/profile.api";
import { CollegeVerificationModal } from "@/features/college/components/CollegeVerificationModal";

export default function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const { homeLocation, setHomeFromCurrentLocation } = useLocationStore();

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);

  // Edit form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch current user details
  const { data: userRes, isLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
  });

  const user = userRes?.data || authUser;

  // Edit profile mutation
  const updateMutation = useMutation({
    mutationFn: (payload: { firstName: string; lastName: string; phoneNumber: string }) =>
      updateCurrentUser(payload),
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      qc.invalidateQueries({ queryKey: ["user", "me"] });
      setIsEditProfileOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Could not update profile.";
      toast.error(msg);
    },
  });

  // Change password mutation
  const passwordMutation = useMutation({
    mutationFn: (payload: any) => changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully.");
      setIsChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Could not change password.";
      toast.error(msg);
    },
  });

  const handleOpenEdit = () => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhoneNumber((user as any).phoneNumber || "");
    }
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ firstName, lastName, phoneNumber });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    passwordMutation.mutate({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    useAuthStore.getState().logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login", { replace: true });
  };

  if (isLoading && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const displayPhone = (user as any)?.phoneNumber || "Phone number not added";

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-4xl space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            Rider Profile
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Personal details, college verification & security
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle text-primary font-extrabold text-xl shadow-soft ring-4 ring-primary/10">
            {user?.firstName?.[0] || "R"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-foreground truncate">
                {user?.firstName} {user?.lastName}
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                <CheckCircle2 className="h-3 w-3" />
                <span>Verified</span>
              </span>
            </div>
            <p className="text-xs text-foreground-secondary truncate mt-0.5">
              {user?.email}
            </p>
            <p className="text-xs text-foreground-secondary mt-0.5">
              {displayPhone}
            </p>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-3 flex gap-2">
          <button
            type="button"
            onClick={handleOpenEdit}
            className="flex-1 rounded-xl bg-primary-subtle py-2 px-3 text-xs font-bold text-primary hover:bg-primary-subtle/80 transition"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="flex-1 rounded-xl border border-border py-2 px-3 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* College Verification Section */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm text-foreground">
              College Verification
            </div>
            <div className="text-xs text-foreground-secondary mt-0.5 truncate">
              {user?.collegeVerified
                ? user?.collegeEmail || "Verified Campus Affiliation"
                : user?.collegeEmail
                ? `${user.collegeEmail} (Pending Verification)`
                : "No college email verified"}
            </div>
          </div>
          {user?.collegeVerified ? (
            <span className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-400 px-2.5 py-1 text-xs font-bold">
              Verified
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollegeModalOpen(true)}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
            >
              Verify Email
            </button>
          )}
        </div>
      </div>

      {/* Saved Home Location Section */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-xs text-foreground-secondary uppercase tracking-wider">
            Saved Home Location
          </div>
          <button
            type="button"
            onClick={async () => {
              toast.info("Detecting current GPS location...");
              const saved = await setHomeFromCurrentLocation();
              if (saved) {
                toast.success(`Home updated: ${saved.address}`);
                qc.invalidateQueries({ queryKey: ["user", "me"] });
              } else {
                toast.error("Could not acquire location. Please check browser permissions.");
              }
            }}
            className="text-xs font-bold text-primary hover:underline"
          >
            {homeLocation ? "Update to GPS" : "Set to GPS"}
          </button>
        </div>
        <div className="text-xs text-foreground font-medium">
          {homeLocation ? homeLocation.address : "No Home location saved yet"}
        </div>
      </div>

      {/* Earn as Driver Banner (Entry Point) */}
      <div className="flex items-center justify-between rounded-2xl bg-primary p-5 text-white shadow-medium">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white">
            <Car className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-sm tracking-tight truncate">
              Become a Driver
            </div>
            <div className="text-xs text-white/80 truncate mt-0.5">
              Earn money on your daily campus commute.
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

      {/* Security & Safety */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft space-y-3">
        <div className="font-bold text-xs text-foreground-secondary uppercase tracking-wider">
          Safety & Policies
        </div>
        <div className="space-y-2 text-xs text-foreground-secondary">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Campus ID & background verified drivers</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span>End-to-end trip monitoring and SOS assistance</span>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger-subtle/30 py-3.5 text-sm font-bold text-danger hover:bg-danger-subtle/50 transition active:scale-95"
      >
        <LogOut className="h-4 w-4" />
        <span>Log Out</span>
      </button>

      {/* ─── Edit Profile Modal ─── */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-dialog bg-surface p-6 shadow-premium border border-border space-y-4">
            <h3 className="text-lg font-bold text-foreground">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-subtle p-2.5 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-subtle p-2.5 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-subtle p-2.5 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-surface-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-soft hover:bg-primary-hover disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Change Password Modal ─── */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-dialog bg-surface p-6 shadow-premium border border-border space-y-4">
            <h3 className="text-lg font-bold text-foreground">Change Password</h3>
            <form onSubmit={handleSavePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-subtle p-2.5 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-subtle p-2.5 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-subtle p-2.5 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-surface-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordMutation.isPending}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-soft hover:bg-primary-hover disabled:opacity-50"
                >
                  {passwordMutation.isPending ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── College Verification Modal ─── */}
      <CollegeVerificationModal
        isOpen={isCollegeModalOpen}
        onClose={() => setIsCollegeModalOpen(false)}
        initialCollegeEmail={user?.collegeEmail || ""}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["user", "me"] })}
      />
    </div>
  );
}
