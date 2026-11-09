import { MediaType, TrackingStatus } from "@prisma/client";
import prisma from "../prisma";
import { TrackMovieInput } from "../types/tracking.type";

export class MovieTrackingService {
  async getMovies(userId: string, status?: TrackingStatus) {
    return prisma.trackedMedia.findMany({
      where: {
        userId,
        mediaType: MediaType.MOVIE,
        ...(status && { status }),
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getMovieDetails(userId: string, tmdbId: number) {
    return prisma.trackedMedia.findUnique({
      where: {
        userId_tmdbId_mediaType: { userId, tmdbId, mediaType: MediaType.MOVIE },
      },
      include: {
        watchHistory: {
          orderBy: { watchedAt: "desc" },
        },
      },
    });
  }

  async trackMovie(userId: string, data: TrackMovieInput) {
    return prisma.$transaction(async (tx) => {
      const tracked = await tx.trackedMedia.upsert({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId: data.tmdbId,
            mediaType: MediaType.MOVIE,
          },
        },
        update: {
          status: data.status,
          title: data.title ?? undefined,
          posterPath: data.posterPath ?? undefined,
        },
        create: {
          userId,
          tmdbId: data.tmdbId,
          mediaType: MediaType.MOVIE,
          status: data.status,
          title: data.title,
          posterPath: data.posterPath,
        },
      });

      if (data.status === TrackingStatus.COMPLETED) {
        await tx.watchHistory.create({
          data: {
            trackedMediaId: tracked.id,
            watchedAt: data.watchedAt || new Date(),
          },
        });

        await tx.watchlistItem.deleteMany({
          where: {
            tmdbId: data.tmdbId,
            mediaType: MediaType.MOVIE,
            watchlist: {
              userId: userId,
            },
          },
        });
      }

      return tracked;
    });
  }

  async updateMovieStatus(
    userId: string,
    tmdbId: number,
    status: TrackingStatus,
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.trackedMedia.findUnique({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId,
            mediaType: MediaType.MOVIE,
          },
        },
      });

      if (!existing) {
        throw new Error("MEDIA_NOT_TRACKED");
      }

      const updated = await tx.trackedMedia.update({
        where: { id: existing.id },
        data: { status },
      });

      if (
        status === TrackingStatus.COMPLETED &&
        existing.status !== TrackingStatus.COMPLETED
      ) {
        await tx.watchHistory.create({
          data: {
            trackedMediaId: existing.id,
          },
        });

        await tx.watchlistItem.deleteMany({
          where: {
            tmdbId,
            mediaType: MediaType.MOVIE,
            watchlist: {
              userId: userId,
            },
          },
        });
      }

      return updated;
    });
  }

  async removeMovie(userId: string, tmdbId: number) {
    try {
      await prisma.trackedMedia.delete({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId,
            mediaType: MediaType.MOVIE,
          },
        },
      });
    } catch (error) {
      throw new Error("MEDIA_NOT_TRACKED");
    }
  }
}
