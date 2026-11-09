import { Request, Response } from "express";
import { MovieTrackingService } from "../services/movieTracking.service";
import { TrackingStatus } from "@prisma/client";

export class MovieTrackingController {
  private movieService = new MovieTrackingService();

  getMovies = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { status } = req.query;

    try {
      const movies = await this.movieService.getMovies(
        userId,
        status as TrackingStatus,
      );
      return res.status(200).json(movies);
    } catch (error) {
      console.error("Get movies error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  getMovieDetails = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const tmdbId = Number(req.params.tmdbId);

    try {
      const movieDetails = await this.movieService.getMovieDetails(
        userId,
        tmdbId,
      );

      if (!movieDetails) {
        return res
          .status(404)
          .json({ error: "Movie tracking details not found." });
      }

      return res.status(200).json(movieDetails);
    } catch (error) {
      console.error("Get movie details error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  trackMovie = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { tmdbId, status, title, posterPath, watchedAt } = req.body;

    try {
      const result = await this.movieService.trackMovie(userId, {
        tmdbId,
        status,
        title,
        posterPath,
        watchedAt: watchedAt ? new Date(watchedAt) : undefined,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Track movie error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  updateMovieStatus = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const tmdbId = Number(req.params.tmdbId);
    const { status } = req.body;

    try {
      const result = await this.movieService.updateMovieStatus(
        userId,
        tmdbId,
        status,
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "MEDIA_NOT_TRACKED") {
        return res
          .status(404)
          .json({ error: "Movie is not currently tracked." });
      }
      console.error("Update movie status error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  removeMovie = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const tmdbId = Number(req.params.tmdbId);

    try {
      await this.movieService.removeMovie(userId, tmdbId);
      return res.status(200).json({ message: "Movie removed successfully." });
    } catch (error) {
      if (error instanceof Error && error.message === "MEDIA_NOT_TRACKED") {
        return res
          .status(404)
          .json({ error: "Movie is not currently tracked." });
      }
      console.error("Remove movie error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}
