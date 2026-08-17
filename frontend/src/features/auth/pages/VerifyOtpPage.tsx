import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

import OtpInputGroup from "@/features/auth/components/OtpInputGroup";
import AuthLayout from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { resendOtp, verifyOtp } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginUser = useAuthStore((state) => state.login);

  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const otpCode = otp.join("");
  const isOtpComplete = otp.every((digit) => digit.length === 1);

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isOtpComplete) {
      toast.error("Please enter all 6 digits.");
      return;
    }

    try {
      setIsVerifying(true);
      const response = await verifyOtp({ email, otp: otpCode });
      
      const authData = (response as unknown as { data?: { accessToken: string; refreshToken: string; userId: string; email: string; firstName: string; lastName: string; role: "RIDER" | "DRIVER" | "ADMIN" } })?.data;
      if (authData && authData.accessToken) {
        loginUser(authData);
      }
      
      toast.success(response?.message || "Email verified successfully!");
      // As requested in prompt: Email Verification: successful verification → Rider Dashboard
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Invalid or expired OTP code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    try {
      setIsResending(true);
      const response = await resendOtp({ email });
      toast.success(response.message || "A new 6-digit code has been sent.");
      setOtp(Array(6).fill(""));
      setCountdown(30);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Unable to resend OTP code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      showBack={true}
      backTo="/register"
      headerIcon={
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-subtle text-primary shadow-xs">
          <MailCheck className="h-7 w-7" />
        </div>
      }
      title="Verify your email"
      subtitle="We sent a 6-digit verification code to your email."
    >
      <form onSubmit={handleVerify} className="space-y-6">
        {/* OTP 6-Digit Group */}
        <div className="pt-2">
          <OtpInputGroup value={otp} onChange={setOtp} />
        </div>

        {/* Resend & Change Email Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-foreground-secondary">
            Didn't receive the code?{" "}
            {countdown > 0 ? (
              <span className="font-semibold text-primary">
                Resend in {countdown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-semibold text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </p>

          <div>
            <Link
              to="/register"
              className="inline-block text-xs font-medium text-primary hover:underline pt-1"
            >
              Change Email
            </Link>
          </div>
        </div>

        {/* Verify Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isVerifying}
            disabled={!isOtpComplete || isVerifying}
            className="rounded-xl font-medium text-white"
          >
            Verify
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}