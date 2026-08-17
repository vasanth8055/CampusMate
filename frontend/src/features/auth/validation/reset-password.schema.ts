import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    otp: z.string().min(1, "Reset code is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, "Must contain at least one number or special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;



