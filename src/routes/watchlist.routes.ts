import { Router } from "express";
import { WatchlistController } from "../controllers/watchlist.controller";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  addWatchlistItemSchema,
  getWatchlistQuerySchema,
  removeWatchlistItemParamSchema,
} from "../validations/watchlist.validation";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const watchlistController = new WatchlistController();

router.get(
  "/",
  authMiddleware,
  validateQuery(getWatchlistQuerySchema),
  watchlistController.getWatchlist,
);

router.post(
  "/items",
  authMiddleware,
  validateBody(addWatchlistItemSchema),
  watchlistController.addItem,
);

router.delete(
  "/items/:mediaType/:tmdbId",
  authMiddleware,
  validateParams(removeWatchlistItemParamSchema),
  watchlistController.removeItem,
);

export default router;
