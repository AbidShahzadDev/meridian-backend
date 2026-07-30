import { z } from "zod";

export const ChatHistoryMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().trim().min(1).max(1000),
}).strict();

export const ChatMessageSchema = z.object({
  message: z.string().trim().min(1).max(500),
  history: z.array(ChatHistoryMessageSchema).max(12).default([]),
}).strict().superRefine((input, ctx) => {
  input.history.forEach((entry, index) => {
    const expectedRole = index % 2 === 0 ? "user" : "model";
    if (entry.role !== expectedRole) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["history", index, "role"], message: `Expected ${expectedRole} role` });
    }
  });
  if (input.history.length % 2 !== 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["history"], message: "History must contain complete user/model turns" });
  }
});

export const ChatListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
}).strict();

export type ChatListQuery = z.infer<typeof ChatListQuerySchema>;
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
