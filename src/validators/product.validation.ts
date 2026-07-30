import { z } from "zod";

const optionalUrl = (message: string) =>
  z.preprocess((value) => value === "" || value === null ? undefined : value, z.string().url(message).optional());

const optionalId = z.preprocess(
  (value) => value === "" || value === null ? undefined : value,
  z.string().optional()
);

const optionalUrlGallery = z.preprocess(
  (value) => {
    if (value === "" || value === null) return undefined;
    if (Array.isArray(value)) return value.filter((item) => item !== "" && item !== null);
    return value;
  },
  z.array(z.string().url("Each gallery image must be a valid URL")).optional()
);

export const CreateProductSchema = z.object({
  title: z.string().min(2, "Product title must be at least 2 characters long"),
  description: z.string().optional(),
  shortDescription: z.string().max(250, "Short description must be 250 characters or less").optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: optionalId,
  brandId: optionalId,
  price: z.number().nonnegative("Price must be a positive number"),
  salePrice: z.number().nonnegative("Sale price must be a positive number").optional(),
  stock: z.number().int().nonnegative("Stock must be at least 0").default(0),
  weight: z.number().nonnegative("Weight must be a positive number").optional(),
  dimensions: z.string().optional(),
  featuredImage: optionalUrl("Featured image must be a valid URL"),
  gallery: optionalUrlGallery,
  status: z.enum(["active", "inactive"]).optional(),
  isFeatured: z.boolean().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
