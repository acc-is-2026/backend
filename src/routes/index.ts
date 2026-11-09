import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import movieTrackingRouter from "./movieTracking.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/tracking/movies", movieTrackingRouter);

export default router;
