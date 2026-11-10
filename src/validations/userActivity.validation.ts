import { z } from "zod";
import { MediaType, TrackingStatus } from "@prisma/client";

export const getTrackingLibraryQuerySchema = z.object({
  status: z
    .enum([
      TrackingStatus.WATCHING,
      TrackingStatus.COMPLETED,
      TrackingStatus.DROPPED,
    ])
    .optional(),
  mediaType: z
    .string()
    .transform((val) => val.toUpperCase())
    .refine((val) => val === "ALL" || Object.keys(MediaType).includes(val), {
      message: "Invalid mediaType",
    })
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).optional(),
});
