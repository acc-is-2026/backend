import { Request, Response } from "express";
import { UserActivityService } from "../services/userActivity.service";
import { MediaType, TrackingStatus } from "@prisma/client";

export class UserActivityController {
  private userActivityService = new UserActivityService();

  getUserTrackingLibrary = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { status, mediaType, page, limit } = req.query;

    try {
      const library = await this.userActivityService.getUserTrackingLibrary(
        userId,
        status as TrackingStatus | undefined,
        mediaType as MediaType | undefined,
        page !== undefined ? Number(page) : undefined,
        limit !== undefined ? Number(limit) : undefined,
      );

      return res.status(200).json(library);
    } catch (error) {
      console.error("Get tracking library error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  getUserStats = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    try {
      const stats = await this.userActivityService.getUserStats(userId);
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Get user stats error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}
