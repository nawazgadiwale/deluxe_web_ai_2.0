import { z } from "zod";

export const ChatSchema = z.object({
  sessionId: z.string().optional(),

  message: z
    .string({
      required_error: "Message is required",
    })
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long"),

  customer: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
});
