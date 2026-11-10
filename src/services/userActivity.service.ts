import { MediaType, TrackingStatus } from "@prisma/client";
import prisma from "../prisma";

export class UserActivityService {
  async getUserTrackingLibrary(
    userId: string,
    status?: TrackingStatus,
    mediaType?: "ALL" | MediaType,
    page?: number,
    limit?: number,
  ) {
    const filterMediaType = mediaType === "ALL" ? undefined : mediaType;
    const where = {
      userId,
      ...(status && { status }),
      ...(filterMediaType && { mediaType: filterMediaType }),
    };

    const isPaginated = page !== undefined && limit !== undefined;

    const [trackingList, total] = await prisma.$transaction([
      prisma.trackedMedia.findMany({
        where,
        include: {
          watchHistory: {
            orderBy: [
              { seasonNumber: { sort: "desc", nulls: "last" } },
              { episodeNumber: { sort: "desc", nulls: "last" } },
            ],
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: isPaginated ? (page - 1) * limit : undefined,
        take: isPaginated ? limit : undefined,
      }),
      prisma.trackedMedia.count({ where }),
    ]);

    const items = trackingList.map((item) => {
      const lastWatched = item.watchHistory[0] || null;
      return {
        id: item.id,
        tmdbId: item.tmdbId,
        mediaType: item.mediaType,
        title: item.title,
        posterPath: item.posterPath,
        status: item.status,
        lastWatched: lastWatched
          ? {
              season: lastWatched.seasonNumber,
              episode: lastWatched.episodeNumber,
              date: lastWatched.watchedAt,
            }
          : null,
      };
    });

    return {
      items,
      page: isPaginated ? page : 1,
      totalPages: isPaginated ? Math.max(1, Math.ceil(total / limit)) : 1,
      total,
    };
  }

  async getUserStats(userId: string) {
    const [mediaGroups, episodeGroups] = await Promise.all([
      prisma.trackedMedia.groupBy({
        by: ["mediaType", "status"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.watchHistory.groupBy({
        by: ["trackedMediaId", "seasonNumber", "episodeNumber"],
        where: {
          seasonNumber: { not: null },
          episodeNumber: { not: null },
          trackedMedia: { userId, mediaType: MediaType.TV },
        },
      }),
    ]);

    const buildCounts = (mediaType: MediaType) => {
      const counts = { total: 0, watching: 0, completed: 0, dropped: 0 };

      mediaGroups
        .filter((group) => group.mediaType === mediaType)
        .forEach((group) => {
          const count = group._count._all;
          counts.total += count;
          if (group.status === TrackingStatus.WATCHING)
            counts.watching += count;
          if (group.status === TrackingStatus.COMPLETED)
            counts.completed += count;
          if (group.status === TrackingStatus.DROPPED) counts.dropped += count;
        });

      return counts;
    };

    return {
      episodesWatched: episodeGroups.length,
      shows: buildCounts(MediaType.TV),
      movies: buildCounts(MediaType.MOVIE),
    };
  }
}
