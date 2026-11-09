import { z } from "zod";
import { TrackingStatus } from "@prisma/client";

const trackingStatusEnum = z.enum([
  TrackingStatus.WATCHING,
  TrackingStatus.COMPLETED,
  TrackingStatus.DROPPED,
]);

export const tmdbIdParamSchema = z.object({
  tmdbId: z.string().regex(/^\d+$/, "tmdbId must be a numeric string"),
});

export const filterStatusQuerySchema = z.object({
  status: trackingStatusEnum.optional(),
});

export const trackMovieSchema = z.object({
  tmdbId: z.number().int().positive(),
  status: trackingStatusEnum,
  title: z.string().optional(),
  posterPath: z.string().optional(),
  watchedAt: z.coerce.date().optional(),
});

export const updateStatusSchema = z.object({
  status: trackingStatusEnum,
});

export const getShowDetailsQuerySchema = z.object({
  tmdbTotalEpisodes: z.string().regex(/^\d+$/).optional(),
});

export const trackShowSchema = z.object({
  tmdbId: z.number().int().positive(),
  status: trackingStatusEnum,
  title: z.string().optional(),
  posterPath: z.string().optional(),
  watchedAt: z.coerce.date().optional(),
});

export const trackEpisodeSchema = z.object({
  seasonNumber: z.number().int().min(0),
  episodeNumber: z.number().int().min(0),
  title: z.string().optional(),
  posterPath: z.string().optional(),
  watchedAt: z.coerce.date().optional(),
  status: trackingStatusEnum.optional(),
});

export const trackBulkEpisodesSchema = z.object({
  status: trackingStatusEnum.optional(),
  title: z.string().optional(),
  posterPath: z.string().optional(),
  episodes: z
    .array(
      z.object({
        seasonNumber: z.number().int().min(0),
        episodeNumber: z.number().int().min(0),
      }),
    )
    .min(1, "At least one episode is required"),
});

export const untrackEpisodeSchema = z.object({
  seasonNumber: z.number().int().min(0),
  episodeNumber: z.number().int().min(0),
});
