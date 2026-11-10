import { Request, Response } from "express";
import { HistoryService } from "../services/history.service";
import { MediaType } from "@prisma/client";
import { GetHistoryQuery } from "../validations/history.validation";

export class HistoryController {
  private historyService = new HistoryService();

  getHistory = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { status, mediaType, page, limit } =
      req.validatedQuery as GetHistoryQuery;

    try {
      const history = await this.historyService.getUserHistory(
        userId,
        status,
        mediaType as "ALL" | MediaType | undefined,
        page,
        limit,
      );
      return res.status(200).json(history);
    } catch (error) {
      console.error("Get history error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  removeHistoryEntry = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const historyId = String(req.params.historyId);

    try {
      const result = await this.historyService.removeHistoryEntry(
        userId,
        historyId,
      );

      return res.status(200).json({
        message: "History entry removed.",
        trackedMediaDeleted: result.trackedMediaDeleted,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ENTRY_NOT_FOUND") {
        return res.status(404).json({ error: "History entry not found." });
      }
      console.error("Remove history entry error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}
