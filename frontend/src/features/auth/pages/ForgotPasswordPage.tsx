import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Mail, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { forgotPassword } from "@/features/auth/api/auth.api";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/features/auth/validation/forgot-password.schema";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data);
      toast.success("Password reset code sent to your email.");
      navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message ?? "Unable to send reset code. Please try again."
      );
    }
  };

  return (
    <AuthLayout
      showBack={true}
      backTo="/login"
      topAccent={true}
      headerIcon={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary shadow-xs">
          <RotateCcw className="h-6 w-6" />
        </div>
      }
      title="Forgot Password?"
      subtitle="Enter your registered email and we'll help you reset your password."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          prefixIcon={<Mail className="h-4 w-4" />}
          placeholder="name@university.edu"
          {...register("email")}
          error={errors.email?.message}
        />

        <div className="pt-2 space-y-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            className="rounded-xl font-medium text-white"
          >
            Send Reset Code
          </Button>

          <Link
            to="/login"
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-surface-elevated transition-colors"
          >
            Back to Log In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}