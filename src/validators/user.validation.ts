import { z } from "zod";

export const CreateUserSchema = z.object({
  // telegramId: z.string().min(1, "Telegram ID is required"),
  username: z.string().min(2, "Username must be at least 2 characters long"),
  firstName: z.string().min(2, "First name must be at least 2 characters long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.string().email().transform((value) => value.toLowerCase()),
  phoneNo: z.string().min(10, "Phone number must be at least 10 characters long").optional(),
  profilePicture: z.string().url("Profile picture must be a valid URL").optional(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["buyer", "admin", "super_admin"]).default("buyer"),
  isActive: z.boolean().default(true),
});

export const UpdateUserSchema = CreateUserSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided for update",
  }
);

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
