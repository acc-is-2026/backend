import { Router } from "express";
import { authLimiter } from "../middlewares/authLimiter.middleware";
import { AuthController } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate.middleware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validations/auth.validation";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  authController.register,
);

router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  authController.login,
);

router.post(
  "/forgot-password",
  authLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  authLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);

export default router;
