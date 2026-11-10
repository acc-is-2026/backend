import { Request, Response } from "express";
import { WatchlistService } from "../services/watchlist.service";
import { MediaType } from "@prisma/client";

export class WatchlistController {
  private watchlistService = new WatchlistService();

  getWatchlist = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { mediaType, page, limit } = req.query;

    try {
      const watchlist = await this.watchlistService.getWatchlist(
        userId,
        mediaType as MediaType | undefined,
        Number(page ?? 1),
        Number(limit ?? 20),
      );
      return res.status(200).json(watchlist);
    } catch (error) {
      if (error instanceof Error && error.message === "WATCHLIST_NOT_FOUND") {
        return res
          .status(404)
          .json({ error: "Watchlist not found for this user." });
      }
      console.error("Get watchlist error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  addItem = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { tmdbId, mediaType, title, posterPath } = req.body;

    try {
      const item = await this.watchlistService.addItem(userId, {
        tmdbId,
        mediaType,
        title,
        posterPath,
      });
      return res.status(200).json(item);
    } catch (error) {
      if (error instanceof Error && error.message === "WATCHLIST_NOT_FOUND") {
        return res
          .status(404)
          .json({ error: "Watchlist not found for this user." });
      }
      console.error("Add watchlist item error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  removeItem = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { mediaType, tmdbId } = req.params;

    try {
      await this.watchlistService.removeItem(
        userId,
        (mediaType as string).toUpperCase() as MediaType,
        Number(tmdbId),
      );
      return res.status(200).json({ message: "Item removed from watchlist." });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "WATCHLIST_NOT_FOUND") {
          return res
            .status(404)
            .json({ error: "Watchlist not found for this user." });
        }
        if (error.message === "ITEM_NOT_FOUND") {
          return res
            .status(404)
            .json({ error: "Item is not in your watchlist." });
        }
      }
      console.error("Remove watchlist item error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}
