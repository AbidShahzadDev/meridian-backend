import { z } from "zod";

export const AuthInputSchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase()),
  phoneNo: z.string().min(10, { message: "Phone number should be at least 10 characters long" }),
  firstName: z.string().min(2, { message: "First name should be at least 2 characters long" }),
  lastName: z.string().min(2, { message: "Last name should be at least 2 characters long" }),
  username: z.string().min(2, { message: "Username should be at least 2 characters long" }),
  // telegramId: z.string().min(1, { message: "Telegram ID is required" }),
  profilePicture: z.string().min(2, { message: "Profile Picture should be at least 2 characters long" }),
  password: z.string().min(8, { message: "Password should be at least 8 characters long" }),
});

export const LoginSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export const VerifyOTPSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase()),
  otp: z.string().regex(/^\d{4,6}$/, "OTP must be a 4-to-6 digit code"),
}).strict();

export const ResendRegistrationOTPSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase()),
}).strict();

export const refreshAccessTokenSchema = z.object({
  refreshToken: z.string(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Password confirmation is required"),
}).strict().refine((input) => input.newPassword === input.confirmPassword, {
  path: ["confirmPassword"], message: "Password confirmation does not match",
}).refine((input) => input.newPassword !== input.currentPassword, {
  path: ["newPassword"], message: "New password must be different from the current password",
});

export type AuthInput = z.infer<typeof AuthInputSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type VerifyOTPInput = z.infer<typeof VerifyOTPSchema>;
export type ResendRegistrationOTPInput = z.infer<typeof ResendRegistrationOTPSchema>;
export type RefreshAccessTokenInput = z.infer<typeof refreshAccessTokenSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
