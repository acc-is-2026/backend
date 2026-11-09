import { Router } from "express";
import { MovieTrackingController } from "../controllers/movieTracking.controller";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  filterStatusQuerySchema,
  tmdbIdParamSchema,
  trackMovieSchema,
  updateStatusSchema,
} from "../validations/tracking.validation";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const movieController = new MovieTrackingController();

router.get(
  "/",
  authMiddleware,
  validateQuery(filterStatusQuerySchema),
  movieController.getMovies,
);

router.get(
  "/:tmdbId",
  authMiddleware,
  validateParams(tmdbIdParamSchema),
  movieController.getMovieDetails,
);

router.post(
  "/",
  authMiddleware,
  validateBody(trackMovieSchema),
  movieController.trackMovie,
);

router.patch(
  "/:tmdbId/status",
  authMiddleware,
  validateParams(tmdbIdParamSchema),
  validateBody(updateStatusSchema),
  movieController.updateMovieStatus,
);

router.delete(
  "/:tmdbId",
  authMiddleware,
  validateParams(tmdbIdParamSchema),
  movieController.removeMovie,
);

export default router;
