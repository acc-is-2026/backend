import { MediaType, TrackingStatus } from "@prisma/client";
import prisma from "../prisma";

export class HistoryService {
  async getUserHistory(
    userId: string,
    status?: TrackingStatus,
    mediaType?: "ALL" | MediaType,
    page?: number,
    limit?: number,
  ) {
    const filterMediaType = mediaType === "ALL" ? undefined : mediaType;
    const where = {
      trackedMedia: {
        userId,
        ...(status && { status }),
        ...(filterMediaType && { mediaType: filterMediaType }),
      },
    };

    const isPaginated = page !== undefined && limit !== undefined;

    const [historyList, total] = await prisma.$transaction([
      prisma.watchHistory.findMany({
        where,
        include: {
          trackedMedia: {
            select: {
              id: true,
              tmdbId: true,
              mediaType: true,
              title: true,
              posterPath: true,
              status: true,
            },
          },
        },
        orderBy: { watchedAt: "desc" },
        skip: isPaginated ? (page - 1) * limit : undefined,
        take: isPaginated ? limit : undefined,
      }),
      prisma.watchHistory.count({ where }),
    ]);

    const items = historyList.map((entry) => ({
      id: entry.id,
      trackedMediaId: entry.trackedMedia.id,
      tmdbId: entry.trackedMedia.tmdbId,
      mediaType: entry.trackedMedia.mediaType,
      title: entry.trackedMedia.title,
      posterPath: entry.trackedMedia.posterPath,
      status: entry.trackedMedia.status,
      season: entry.seasonNumber,
      episode: entry.episodeNumber,
      watchedAt: entry.watchedAt,
    }));

    return {
      items,
      page: isPaginated ? page : 1,
      totalPages: isPaginated ? Math.max(1, Math.ceil(total / limit)) : 1,
      total,
    };
  }

  async removeHistoryEntry(userId: string, historyId: string) {
    return prisma.$transaction(async (tx) => {
      const historyEntry = await tx.watchHistory.findUnique({
        where: { id: historyId },
        include: { trackedMedia: true },
      });

      if (!historyEntry || historyEntry.trackedMedia.userId !== userId) {
        throw new Error("ENTRY_NOT_FOUND");
      }

      await tx.watchHistory.delete({
        where: { id: historyId },
      });

      const remainingEntries = await tx.watchHistory.count({
        where: { trackedMediaId: historyEntry.trackedMediaId },
      });

      if (remainingEntries === 0) {
        await tx.trackedMedia.delete({
          where: { id: historyEntry.trackedMediaId },
        });
      }

      return {
        deletedHistoryId: historyId,
        trackedMediaDeleted: remainingEntries === 0,
      };
    });
  }
}
