import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import movieTrackingRouter from "./movieTracking.routes";
import showTrackingRouter from "./showTracking.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/tracking/movies", movieTrackingRouter);
router.use("/tracking/tv", showTrackingRouter);

export default router;
