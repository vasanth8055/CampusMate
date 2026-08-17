import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { useUIStore } from "@/store/ui.store";
import { login } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import {
  loginSchema,
  type LoginFormData,
} from "../validation/login.schema";

import { Input, PasswordInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginForm() {
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      const response = await login(data);

      loginUser(response.data);
      toast.success(response.message || "Logged in successfully!");
      const { setCurrentMode } = useUIStore.getState();

      if (response.data.role === "DRIVER") {
        setCurrentMode("DRIVER");
      } else {
        setCurrentMode("RIDER");
      }

      switch (response.data.role) {
        case "ADMIN":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "DRIVER":
          navigate("/driver/dashboard", { replace: true });
          break;
        case "RIDER":
        default:
          navigate("/dashboard", { replace: true });
          break;
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email Address"
        type="email"
        prefixIcon={<Mail className="h-4 w-4" />}
        placeholder="name@example.com"
        {...register("email")}
        error={errors.email?.message}
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-label text-foreground">Password</label>
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <PasswordInput
          prefixIcon={<Lock className="h-4 w-4" />}
          placeholder="Enter your password"
          {...register("password")}
          error={errors.password?.message}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          className="rounded-xl font-medium text-white"
        >
          Log In
        </Button>
      </div>

      <div className="pt-2 text-center text-sm text-foreground-secondary">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-primary hover:underline"
        >
          Create Account
        </Link>
      </div>
    </form>
  );
}