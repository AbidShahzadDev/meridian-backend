import { z } from "zod";

export const NotificationDeviceSchema = z.object({
  token: z.string().trim().min(20).max(4096),
  platform: z.enum(["web", "android", "ios"]).optional(),
}).strict();

export const NotificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.preprocess((value) => value === "true" || value === true, z.boolean().default(false)),
}).strict();

export type NotificationDeviceInput = z.infer<typeof NotificationDeviceSchema>;
export type NotificationListQuery = z.infer<typeof NotificationListQuerySchema>;
