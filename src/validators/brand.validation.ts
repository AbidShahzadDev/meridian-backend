import { z } from "zod";

export const CreateBrandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters long"),
  logo: z.string().url("Logo must be a valid URL").optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const UpdateBrandSchema = CreateBrandSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>;
