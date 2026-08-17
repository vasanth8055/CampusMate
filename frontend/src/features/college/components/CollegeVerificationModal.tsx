import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  GraduationCap,
  Mail,
  KeyRound,
  CheckCircle2,
  Loader2,
  X,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { getColleges, sendCollegeVerificationOtp, verifyCollegeOtp } from "../api/college.api";

interface CollegeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialCollegeEmail?: string;
}

export function CollegeVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  initialCollegeEmail = "",
}: CollegeVerificationModalProps) {
  const qc = useQueryClient();

  const [step, setStep] = useState<"EMAIL" | "OTP" | "SUCCESS">("EMAIL");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [collegeEmail, setCollegeEmail] = useState<string>(initialCollegeEmail);
  const [otp, setOtp] = useState<string>("");

  const { data: collegesRes, isLoading: collegesLoading } = useQuery({
    queryKey: ["colleges"],
    queryFn: getColleges,
    staleTime: 1000 * 60 * 10,
    enabled: isOpen,
  });

  const colleges = collegesRes?.data || [];

  // Selected college object
  const selectedCollege = colleges.find((c) => c.id === selectedCollegeId);

  // Send OTP Mutation
  const sendOtpMutation = useMutation({
    mutationFn: (payload: { collegeId: string; collegeEmail: string }) =>
      sendCollegeVerificationOtp(payload),
    onSuccess: () => {
      toast.success(`Verification OTP sent to ${collegeEmail}`);
      setStep("OTP");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Could not send verification OTP. Please verify your college selection and email.";
      toast.error(msg);
    },
  });

  // Verify OTP Mutation
  const verifyOtpMutation = useMutation({
    mutationFn: (payload: { collegeEmail: string; otp: string }) =>
      verifyCollegeOtp(payload),
    onSuccess: () => {
      toast.success("College email verified successfully!");
      qc.invalidateQueries({ queryKey: ["user", "me"] });
      qc.invalidateQueries({ queryKey: ["driver", "me"] });
      setStep("SUCCESS");
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid or expired OTP. Please try again.";
      toast.error(msg);
    },
  });

  const handleClose = () => {
    setStep("EMAIL");
    setOtp("");
    onClose();
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollegeId) {
      toast.error("Please select your affiliated college.");
      return;
    }
    if (!collegeEmail.trim() || !collegeEmail.includes("@")) {
      toast.error("Please enter a valid college email address.");
      return;
    }
    if (
      selectedCollege?.emailDomain &&
      !collegeEmail.toLowerCase().endsWith(selectedCollege.emailDomain.toLowerCase())
    ) {
      toast.error(
        `Email must end with @${selectedCollege.emailDomain} for ${selectedCollege.shortName}`
      );
      return;
    }

    sendOtpMutation.mutate({
      collegeId: selectedCollegeId,
      collegeEmail: collegeEmail.trim(),
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 4) {
      toast.error("Please enter the complete verification code.");
      return;
    }
    verifyOtpMutation.mutate({
      collegeEmail: collegeEmail.trim(),
      otp: otp.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-surface border border-border p-6 shadow-premium space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-foreground-secondary hover:bg-surface-subtle hover:text-foreground transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ─── STEP 1: SELECT COLLEGE & ENTER EMAIL ─── */}
        {step === "EMAIL" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary shadow-soft">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Verify College Email
                </h3>
                <p className="text-xs text-foreground-secondary mt-0.5">
                  Confirm your campus student or staff affiliation
                </p>
              </div>
            </div>

            {/* College Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Select Your College / Campus
              </label>
              {collegesLoading ? (
                <div className="flex items-center gap-2 p-3 text-xs text-foreground-secondary">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading accredited campus list...</span>
                </div>
              ) : (
                <select
                  required
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">-- Choose your college --</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shortName} — {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* College Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Official College Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-foreground-muted" />
                <input
                  type="email"
                  required
                  placeholder={
                    selectedCollege
                      ? `e.g. 238W1A5499@${selectedCollege.emailDomain}`
                      : "e.g. student@vrsec.ac.in"
                  }
                  value={collegeEmail}
                  onChange={(e) => setCollegeEmail(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-3 text-xs font-semibold text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
                />
              </div>
              {selectedCollege && (
                <p className="text-[11px] text-foreground-muted flex items-center gap-1">
                  <span>Domain required:</span>
                  <span className="font-mono font-bold text-primary">
                    @{selectedCollege.emailDomain}
                  </span>
                </p>
              )}
            </div>

            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-2xl border border-border py-3 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendOtpMutation.isPending}
                className="flex-1 rounded-2xl bg-primary py-3 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendOtpMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ─── STEP 2: ENTER OTP ─── */}
        {step === "OTP" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary shadow-soft">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Enter 6-Digit Code
                </h3>
                <p className="text-xs text-foreground-secondary mt-0.5 truncate max-w-[240px]">
                  Sent to {collegeEmail}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Verification OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center tracking-[0.4em] font-mono text-xl font-black rounded-2xl border border-border bg-surface p-3.5 text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
              />
              <p className="text-[11px] text-foreground-muted text-center">
                Check your college inbox or spam folder. OTP is valid for 5 minutes.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep("EMAIL")}
                className="text-foreground-secondary hover:text-foreground font-semibold"
              >
                Change Email
              </button>
              <button
                type="button"
                disabled={sendOtpMutation.isPending}
                onClick={() =>
                  sendOtpMutation.mutate({
                    collegeId: selectedCollegeId,
                    collegeEmail: collegeEmail.trim(),
                  })
                }
                className="text-primary hover:underline font-bold flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Resend Code</span>
              </button>
            </div>

            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-2xl border border-border py-3 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifyOtpMutation.isPending || !otp}
                className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-soft transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verify & Save</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ─── STEP 3: SUCCESS ─── */}
        {step === "SUCCESS" && (
          <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mx-auto shadow-medium">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">
                College Affiliation Verified!
              </h3>
              <p className="text-xs text-foreground-secondary mt-1">
                Your college status is now confirmed in CampusMate.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
