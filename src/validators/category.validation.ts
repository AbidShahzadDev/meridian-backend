import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters long"),
  image: z.string().url("Image must be a valid URL").optional(),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  parentId: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
