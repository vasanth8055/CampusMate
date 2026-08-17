import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  User,
  Mail,
  GraduationCap,
  Smartphone,
  Lock,
  KeyRound,
  ArrowRight,
  Info,
} from "lucide-react";

import { register as registerUser } from "../api/auth.api";
import {
  registerSchema,
  type RegisterFormData,
} from "../validation/register.schema";

import { Input, PasswordInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      const response = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        collegeEmail: data.collegeEmail || undefined,
      });

      toast.success(response.message || "Account created successfully!");
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Info Notice Banner */}
      <div className="flex items-start gap-3 rounded-2xl bg-primary-subtle/80 p-3.5 text-xs text-primary border border-primary/20">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p className="leading-snug font-medium">
          Every new account starts as a Rider. You can become a Driver later.
        </p>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="First Name"
          prefixIcon={<User className="h-4 w-4" />}
          placeholder=""
          {...register("firstName")}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          prefixIcon={<User className="h-4 w-4" />}
          placeholder=""
          {...register("lastName")}
          error={errors.lastName?.message}
        />
      </div>

      {/* Personal Email */}
      <Input
        label="Personal Email"
        type="email"
        prefixIcon={<Mail className="h-4 w-4" />}
        placeholder=""
        {...register("email")}
        error={errors.email?.message}
      />

      {/* College .edu Email (Optional) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-label text-foreground">
            College .edu Email
          </label>
          <span className="text-xs italic text-foreground-muted">
            Optional
          </span>
        </div>
        <Input
          type="email"
          prefixIcon={<GraduationCap className="h-4 w-4" />}
          placeholder="student@university.edu"
          {...register("collegeEmail")}
          error={errors.collegeEmail?.message}
        />
      </div>

      {/* Phone Number */}
      <Input
        label="Phone Number"
        type="tel"
        prefixIcon={<Smartphone className="h-4 w-4" />}
        placeholder=""
        {...register("phoneNumber")}
        error={errors.phoneNumber?.message}
      />

      {/* Password */}
      <PasswordInput
        label="Password"
        prefixIcon={<Lock className="h-4 w-4" />}
        placeholder=""
        {...register("password")}
        error={errors.password?.message}
      />

      {/* Confirm Password */}
      <PasswordInput
        label="Confirm Password"
        prefixIcon={<KeyRound className="h-4 w-4" />}
        placeholder=""
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      {/* Submit Button */}
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
          Create Account
        </Button>
      </div>

      {/* Footer Link */}
      <div className="pt-2 text-center text-sm text-foreground-secondary">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline"
        >
          Log In
        </Link>
      </div>
    </form>
  );
}