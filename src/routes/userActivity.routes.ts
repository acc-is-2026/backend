import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { UserActivityController } from "../controllers/userActivity.controller";
import { validateQuery } from "../middlewares/validate.middleware";
import { getTrackingLibraryQuerySchema } from "../validations/userActivity.validation";

const router = Router();
const userActivityController = new UserActivityController();

router.get(
  "/tracking-library",
  authMiddleware,
  validateQuery(getTrackingLibraryQuerySchema),
  userActivityController.getUserTrackingLibrary,
);

router.get("/stats", authMiddleware, userActivityController.getUserStats);

export default router;
