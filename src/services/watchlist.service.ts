import prisma from "../prisma";
import { MediaType } from "@prisma/client";
import { AddWatchlistItemInput } from "../types/watchlist.type";

export class WatchlistService {
  private async getUserWatchlist(userId: string) {
    const watchlist = await prisma.watchlist.findFirst({
      where: { userId },
    });

    if (!watchlist) {
      throw new Error("WATCHLIST_NOT_FOUND");
    }

    return watchlist;
  }

  async getWatchlist(
    userId: string,
    mediaType?: "ALL" | MediaType,
    page?: number,
    limit?: number,
  ) {
    const watchlist = await this.getUserWatchlist(userId);

    const filterMediaType = mediaType === "ALL" ? undefined : mediaType;

    const where = {
      watchlistId: watchlist.id,
      ...(filterMediaType && { mediaType: filterMediaType }),
    };

    const isPaginated = page !== undefined && limit !== undefined;

    const [items, total] = await prisma.$transaction([
      prisma.watchlistItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: isPaginated ? (page - 1) * limit : undefined,
        take: isPaginated ? limit : undefined,
      }),
      prisma.watchlistItem.count({ where }),
    ]);

    return {
      items,
      page: isPaginated ? page : 1,
      totalPages: isPaginated ? Math.max(1, Math.ceil(total / limit)) : 1,
      total,
    };
  }

  async addItem(userId: string, data: AddWatchlistItemInput) {
    const watchlist = await this.getUserWatchlist(userId);

    return prisma.watchlistItem.upsert({
      where: {
        watchlistId_tmdbId_mediaType: {
          watchlistId: watchlist.id,
          tmdbId: data.tmdbId,
          mediaType: data.mediaType,
        },
      },
      update: {
        title: data.title ?? undefined,
        posterPath: data.posterPath ?? undefined,
      },
      create: {
        watchlistId: watchlist.id,
        tmdbId: data.tmdbId,
        mediaType: data.mediaType,
        title: data.title,
        posterPath: data.posterPath,
      },
    });
  }

  async removeItem(userId: string, mediaType: MediaType, tmdbId: number) {
    const watchlist = await this.getUserWatchlist(userId);

    try {
      await prisma.watchlistItem.delete({
        where: {
          watchlistId_tmdbId_mediaType: {
            watchlistId: watchlist.id,
            tmdbId,
            mediaType,
          },
        },
      });
    } catch (error) {
      throw new Error("ITEM_NOT_FOUND");
    }
  }
}
