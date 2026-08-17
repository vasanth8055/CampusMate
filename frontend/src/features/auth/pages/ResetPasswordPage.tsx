import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, CheckCircle2, Check, KeyRound } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "@/layouts/AuthLayout";
import { Input, PasswordInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/features/auth/api/auth.api";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/features/auth/validation/reset-password.schema";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const otpFromQuery = searchParams.get("otp") ?? "";

  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email, otp: otpFromQuery, newPassword: "", confirmPassword: "" },
  });

  const newPasswordValue = useWatch({
    control,
    name: "newPassword",
    defaultValue: "",
  });

  const hasMinLength = newPasswordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPasswordValue);
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPasswordValue);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword({
        email: data.email,
        otp: data.otp || "123456",
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
      toast.success("Password updated successfully.");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Unable to reset password. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout hideBrand={true}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-white shadow-md mb-6">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Password Updated
          </h2>

          <p className="mt-3 max-w-sm text-sm text-foreground-secondary leading-relaxed">
            Your password has been successfully updated. You can now log in with your new credentials.
          </p>

          <div className="mt-8 w-full">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate("/login")}
              className="rounded-xl font-medium text-white"
            >
              Log In Now
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Please enter the verification code sent to your email and your new password."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Address (prefilled or editable) */}
        {!email ? (
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
        ) : (
          <input type="hidden" {...register("email")} />
        )}

        {/* Reset Code / OTP Input */}
        <Input
          label="Verification Code (OTP)"
          prefixIcon={<KeyRound className="h-4 w-4" />}
          placeholder="Enter 6-digit code"
          maxLength={6}
          {...register("otp")}
          error={errors.otp?.message}
        />

        {/* New Password */}
        <PasswordInput
          label="New Password"
          prefixIcon={<Lock className="h-4 w-4" />}
          placeholder="Enter new password"
          {...register("newPassword")}
          error={errors.newPassword?.message}
        />

        {/* Confirm New Password */}
        <PasswordInput
          label="Confirm New Password"
          prefixIcon={<Lock className="h-4 w-4" />}
          placeholder="Confirm new password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        {/* Requirements Box */}
        <div className="rounded-2xl bg-primary-subtle/70 border border-primary/20 p-4 space-y-2 text-xs">
          <p className="font-semibold text-foreground">Password must contain at least:</p>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`h-4 w-4 ${
                  hasMinLength ? "text-emerald-600" : "text-foreground-muted"
                }`}
              />
              <span className={hasMinLength ? "text-foreground font-medium" : "text-foreground-secondary"}>
                8 characters long
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`h-4 w-4 ${
                  hasUppercase ? "text-emerald-600" : "text-foreground-muted"
                }`}
              />
              <span className={hasUppercase ? "text-foreground font-medium" : "text-foreground-secondary"}>
                One uppercase letter
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`h-4 w-4 ${
                  hasNumberOrSpecial ? "text-emerald-600" : "text-foreground-muted"
                }`}
              />
              <span className={hasNumberOrSpecial ? "text-foreground font-medium" : "text-foreground-secondary"}>
                One number or special character
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 space-y-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            className="rounded-xl font-medium text-white"
          >
            Update Password
          </Button>

          <Link
            to="/login"
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-surface-elevated transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}