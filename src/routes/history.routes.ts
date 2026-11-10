import { Router } from "express";
import { HistoryController } from "../controllers/history.controller";
import {
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  getHistoryQuerySchema,
  historyIdParamSchema,
} from "../validations/history.validation";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const historyController = new HistoryController();

router.get(
  "/",
  authMiddleware,
  validateQuery(getHistoryQuerySchema),
  historyController.getHistory,
);

router.delete(
  "/:historyId",
  authMiddleware,
  validateParams(historyIdParamSchema),
  historyController.removeHistoryEntry,
);

export default router;
