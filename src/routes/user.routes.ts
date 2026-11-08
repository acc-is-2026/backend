import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { updateProfileSchema } from "../validations/user.validation";

const router = Router();
const userController = new UserController();

router.get("/me", authMiddleware, userController.getMe);

router.patch(
  "/me",
  authMiddleware,
  validateBody(updateProfileSchema),
  userController.updateProfile,
);

router.delete("/me", authMiddleware, userController.deleteMe);

export default router;
