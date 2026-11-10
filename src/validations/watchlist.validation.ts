import { z } from "zod";
import { MediaType } from "@prisma/client";

export const getWatchlistQuerySchema = z.object({
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

export const removeWatchlistItemParamSchema = z.object({
  mediaType: z
    .string()
    .transform((v) => v.toUpperCase())
    .pipe(z.enum([MediaType.MOVIE, MediaType.TV])),
  tmdbId: z.string().regex(/^\d+$/, "tmdbId must be a numeric string"),
});

export const addWatchlistItemSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(MediaType),
  title: z.string().optional(),
  posterPath: z.string().optional(),
});
