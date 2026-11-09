import { Router } from "express";
import { ShowTrackingController } from "../controllers/showTracking.controller";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  filterStatusQuerySchema,
  getShowDetailsQuerySchema,
  tmdbIdParamSchema,
  trackBulkEpisodesSchema,
  trackEpisodeSchema,
  trackShowSchema,
  untrackEpisodeSchema,
  updateStatusSchema,
} from "../validations/tracking.validation";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const showController = new ShowTrackingController();

router.get(
  "/",
  authMiddleware,
  validateQuery(filterStatusQuerySchema),
  showController.getShows,
);

router.get(
  "/:tmdbId",
  authMiddleware,
  validateParams(tmdbIdParamSchema),
  validateQuery(getShowDetailsQuerySchema),
  showController.getShowDetails,
);

router.post(
  "/",
  authMiddleware,
  validateBody(trackShowSchema),
  showController.trackShow,
);

router.post(
  "/:tmdbId/episodes",
  authMiddleware,
  validateParams(tmdbIdParamSchema),
  validateBody(trackEpisodeSchema),
  showController.trackEpisode,
);

router.post(
  "/:tmdbId/episodes/bulk",
  authMiddleware,
  validateParams(tmdbIdParamSchema),
  validateBody(trackBulkEpisodesSchema),
  showController.trackBulkEpisodes,
);

router.patch(
  "/:tmdbId/status",
  authMiddleware,
  validateParams(tmdbIdParamSchema),
  validateBody(updateStatusSchema),
  showController.updateShowStatus,
);

router.delete(
  "/:tmdbId/episodes",
  authMiddleware,
  validateParams(tmdbIdParamSchema),
  validateBody(untrackEpisodeSchema),
  showController.untrackEpisode,
);

router.delete(
  "/:tmdbId",
  authMiddleware,
  validateParams(tmdbIdParamSchema),
  showController.removeShow,
);

export default router;
