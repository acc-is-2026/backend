import { MediaType, TrackingStatus } from "@prisma/client";
import prisma from "../prisma";
import {
  TrackBulkEpisodesInput,
  TrackEpisodeInput,
  TrackShowInput,
} from "../types/tracking.type";

export class ShowTrackingService {
  async getShows(userId: string, status?: TrackingStatus) {
    return prisma.trackedMedia.findMany({
      where: {
        userId,
        mediaType: MediaType.TV,
        ...(status && { status }),
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getShowDetails(
    userId: string,
    tmdbId: number,
    tmdbTotalEpisodes?: number,
  ) {
    let tracked = await prisma.trackedMedia.findUnique({
      where: {
        userId_tmdbId_mediaType: {
          userId,
          tmdbId,
          mediaType: MediaType.TV,
        },
      },
      include: {
        watchHistory: {
          orderBy: { watchedAt: "desc" },
        },
      },
    });

    if (!tracked) {
      return null;
    }

    if (
      tracked.status === TrackingStatus.COMPLETED &&
      tmdbTotalEpisodes &&
      tracked.watchHistory.length < tmdbTotalEpisodes
    ) {
      tracked = await prisma.trackedMedia.update({
        where: { id: tracked.id },
        data: { status: TrackingStatus.WATCHING },
        include: {
          watchHistory: { orderBy: { watchedAt: "desc" } },
        },
      });
    }

    return tracked;
  }

  async trackShow(userId: string, data: TrackShowInput) {
    return prisma.$transaction(async (tx) => {
      const tracked = await tx.trackedMedia.upsert({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId: data.tmdbId,
            mediaType: MediaType.TV,
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
          mediaType: MediaType.TV,
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
            mediaType: MediaType.TV,
            watchlist: { userId },
          },
        });
      }

      return tracked;
    });
  }

  async trackEpisode(
    userId: string,
    data: TrackEpisodeInput & { status?: TrackingStatus },
  ) {
    return prisma.$transaction(async (tx) => {
      const finalStatus = data.status || TrackingStatus.WATCHING;

      const tracked = await tx.trackedMedia.upsert({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId: data.tmdbId,
            mediaType: MediaType.TV,
          },
        },
        update: {
          status: finalStatus,
          title: data.title ?? undefined,
          posterPath: data.posterPath ?? undefined,
        },
        create: {
          userId,
          tmdbId: data.tmdbId,
          mediaType: MediaType.TV,
          status: finalStatus,
          title: data.title,
          posterPath: data.posterPath,
        },
      });

      const historyEntry = await tx.watchHistory.create({
        data: {
          trackedMediaId: tracked.id,
          seasonNumber: data.seasonNumber,
          episodeNumber: data.episodeNumber,
          watchedAt: data.watchedAt || new Date(),
        },
      });

      if (finalStatus === TrackingStatus.COMPLETED) {
        await tx.watchlistItem.deleteMany({
          where: {
            tmdbId: data.tmdbId,
            mediaType: MediaType.TV,
            watchlist: { userId },
          },
        });
      }

      return { tracked, historyEntry };
    });
  }

  async trackBulkEpisodes(userId: string, data: TrackBulkEpisodesInput) {
    return prisma.$transaction(async (tx) => {
      const finalStatus = data.status || TrackingStatus.WATCHING;

      const tracked = await tx.trackedMedia.upsert({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId: data.tmdbId,
            mediaType: MediaType.TV,
          },
        },
        update: {
          status: finalStatus,
          title: data.title ?? undefined,
          posterPath: data.posterPath ?? undefined,
        },
        create: {
          userId,
          tmdbId: data.tmdbId,
          mediaType: MediaType.TV,
          status: finalStatus,
          title: data.title,
          posterPath: data.posterPath,
        },
      });

      if (data.episodes.length > 0) {
        const existingHistory = await tx.watchHistory.findMany({
          where: { trackedMediaId: tracked.id },
          select: { seasonNumber: true, episodeNumber: true },
        });

        const existingKeys = new Set(
          existingHistory.map((h) => `${h.seasonNumber}-${h.episodeNumber}`),
        );

        const newEpisodesToInsert = data.episodes
          .filter(
            (ep) => !existingKeys.has(`${ep.seasonNumber}-${ep.episodeNumber}`),
          )
          .sort(
            (a, b) =>
              a.seasonNumber - b.seasonNumber ||
              a.episodeNumber - b.episodeNumber,
          );

        if (newEpisodesToInsert.length > 0) {
          const now = Date.now();
          const lastIndex = newEpisodesToInsert.length - 1;

          await tx.watchHistory.createMany({
            data: newEpisodesToInsert.map((ep, index) => ({
              trackedMediaId: tracked.id,
              seasonNumber: ep.seasonNumber,
              episodeNumber: ep.episodeNumber,
              watchedAt: new Date(now - (lastIndex - index)),
            })),
          });
        }
      }

      if (finalStatus === TrackingStatus.COMPLETED) {
        await tx.watchlistItem.deleteMany({
          where: {
            tmdbId: data.tmdbId,
            mediaType: MediaType.TV,
            watchlist: { userId },
          },
        });
      }

      return tracked;
    });
  }

  async updateShowStatus(
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
            mediaType: MediaType.TV,
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
        await tx.watchlistItem.deleteMany({
          where: {
            tmdbId,
            mediaType: MediaType.TV,
            watchlist: { userId },
          },
        });
      }

      return updated;
    });
  }

  async untrackEpisode(
    userId: string,
    tmdbId: number,
    seasonNumber: number,
    episodeNumber: number,
  ) {
    return prisma.$transaction(async (tx) => {
      const tracked = await tx.trackedMedia.findUnique({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId,
            mediaType: MediaType.TV,
          },
        },
      });

      if (!tracked) {
        throw new Error("MEDIA_NOT_TRACKED");
      }

      const { count } = await tx.watchHistory.deleteMany({
        where: { trackedMediaId: tracked.id, seasonNumber, episodeNumber },
      });

      if (count === 0) {
        throw new Error("EPISODE_NOT_WATCHED");
      }

      const latest = await tx.watchHistory.findFirst({
        where: {
          trackedMediaId: tracked.id,
          seasonNumber: { not: null },
          episodeNumber: { not: null },
        },
        orderBy: { watchedAt: "desc" },
      });

      if (!latest) {
        await tx.trackedMedia.delete({ where: { id: tracked.id } });
        return null;
      }

      const updated =
        tracked.status === TrackingStatus.COMPLETED
          ? await tx.trackedMedia.update({
              where: { id: tracked.id },
              data: { status: TrackingStatus.WATCHING },
            })
          : tracked;

      return {
        id: updated.id,
        tmdbId: updated.tmdbId,
        mediaType: updated.mediaType,
        title: updated.title,
        posterPath: updated.posterPath,
        status: updated.status,
        lastWatched: {
          season: latest.seasonNumber,
          episode: latest.episodeNumber,
          date: latest.watchedAt,
        },
      };
    });
  }

  async removeShow(userId: string, tmdbId: number) {
    try {
      await prisma.trackedMedia.delete({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId,
            mediaType: MediaType.TV,
          },
        },
      });
    } catch (error) {
      throw new Error("MEDIA_NOT_TRACKED");
    }
  }
}
