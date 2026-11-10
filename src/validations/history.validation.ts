import { MediaType, TrackingStatus } from "@prisma/client";
import { z } from "zod";

export const getHistoryQuerySchema = z.object({
  status: z
    .enum([
      TrackingStatus.WATCHING,
      TrackingStatus.COMPLETED,
      TrackingStatus.DROPPED,
    ])
    .optional(),
  mediaType: z
    .string()
    .transform((v) => v.toUpperCase())
    .refine((v) => v === "ALL" || Object.keys(MediaType).includes(v), {
      message: "Invalid mediaType",
    })
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).optional(),
});
export type GetHistoryQuery = z.infer<typeof getHistoryQuerySchema>;

export const historyIdParamSchema = z.object({
  historyId: z.uuid("Invalid history ID format"),
});
