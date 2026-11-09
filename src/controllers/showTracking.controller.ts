import { Request, Response } from "express";
import { ShowTrackingService } from "../services/showTracking.service";
import { TrackingStatus } from "@prisma/client";

export class ShowTrackingController {
  private showService = new ShowTrackingService();

  getShows = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { status } = req.query;

    try {
      const shows = await this.showService.getShows(
        userId,
        status as TrackingStatus,
      );
      return res.status(200).json(shows);
    } catch (error) {
      console.error("Get shows error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  getShowDetails = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const tmdbId = Number(req.params.tmdbId);
    const tmdbTotalEpisodes = req.query.tmdbTotalEpisodes
      ? Number(req.query.tmdbTotalEpisodes)
      : undefined;

    try {
      const showDetails = await this.showService.getShowDetails(
        userId,
        tmdbId,
        tmdbTotalEpisodes,
      );

      if (!showDetails) {
        return res
          .status(404)
          .json({ error: "Show tracking details not found." });
      }

      return res.status(200).json(showDetails);
    } catch (error) {
      console.error("Get show details error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  trackShow = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { tmdbId, status, title, posterPath, watchedAt } = req.body;

    try {
      const result = await this.showService.trackShow(userId, {
        tmdbId,
        status,
        title,
        posterPath,
        watchedAt: watchedAt ? new Date(watchedAt) : undefined,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Track show error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  trackEpisode = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const tmdbId = Number(req.params.tmdbId);
    const {
      seasonNumber,
      episodeNumber,
      title,
      posterPath,
      watchedAt,
      status,
    } = req.body;

    try {
      const result = await this.showService.trackEpisode(userId, {
        tmdbId,
        seasonNumber,
        episodeNumber,
        title,
        posterPath,
        watchedAt: watchedAt ? new Date(watchedAt) : undefined,
        status,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Track episode error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  trackBulkEpisodes = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const tmdbId = Number(req.params.tmdbId);
    const { episodes, title, posterPath, status } = req.body;

    try {
      const result = await this.showService.trackBulkEpisodes(userId, {
        tmdbId,
        episodes,
        title,
        posterPath,
        status,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Track bulk episodes error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  updateShowStatus = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const tmdbId = Number(req.params.tmdbId);
    const { status } = req.body;

    try {
      const result = await this.showService.updateShowStatus(
        userId,
        tmdbId,
        status,
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "MEDIA_NOT_TRACKED") {
        return res
          .status(404)
          .json({ error: "Show is not currently tracked." });
      }
      console.error("Update show status error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  untrackEpisode = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const tmdbId = Number(req.params.tmdbId);
    const { seasonNumber, episodeNumber } = req.body;

    try {
      const tracked = await this.showService.untrackEpisode(
        userId,
        tmdbId,
        seasonNumber,
        episodeNumber,
      );
      return res.status(200).json({ tracked });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "MEDIA_NOT_TRACKED") {
          return res
            .status(404)
            .json({ error: "Show is not currently tracked." });
        }
        if (error.message === "EPISODE_NOT_WATCHED") {
          return res
            .status(404)
            .json({ error: "This episode is not in your watch history." });
        }
      }
      console.error("Untrack episode error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  removeShow = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const tmdbId = Number(req.params.tmdbId);

    try {
      await this.showService.removeShow(userId, tmdbId);
      return res.status(200).json({ message: "Show removed successfully." });
    } catch (error) {
      if (error instanceof Error && error.message === "MEDIA_NOT_TRACKED") {
        return res
          .status(404)
          .json({ error: "Show is not currently tracked." });
      }
      console.error("Remove show error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}
