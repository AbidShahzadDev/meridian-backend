import { z } from "zod";

export const OrderStatusSchema = z.enum([
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled",
]);

export const PlaceCodOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().trim().min(1),
    quantity: z.number().int().min(1).max(100),
  }).strict()).min(1).max(50),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2).max(120),
    phoneNo: z.string().trim().min(7).max(30),
    addressLine1: z.string().trim().min(5, "Address line 1 must be at least 5 characters").max(250, "Address line 1 must be 250 characters or fewer"),
    addressLine2: z.string().trim().max(250).optional(),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().max(100).optional(),
    postalCode: z.string().trim().max(30).optional(),
    country: z.string().trim().min(2).max(100),
  }).strict(),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.literal("cash_on_delivery").default("cash_on_delivery"),
}).strict().superRefine((input, ctx) => {
  const ids = new Set<string>();
  input.items.forEach((item, index) => {
    if (ids.has(item.productId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["items", index, "productId"], message: "Each product may appear only once" });
    }
    ids.add(item.productId);
  });
});

export const UpdateOrderStatusSchema = z.object({ status: OrderStatusSchema }).strict();

export const OrderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: OrderStatusSchema.optional(),
}).strict();

export type PlaceCodOrderInput = z.infer<typeof PlaceCodOrderSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderListQuery = z.infer<typeof OrderListQuerySchema>;
