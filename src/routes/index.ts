import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import movieTrackingRouter from "./movieTracking.routes";
import showTrackingRouter from "./showTracking.routes";
import watchlistRouter from "./watchlist.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/tracking/movies", movieTrackingRouter);
router.use("/tracking/tv", showTrackingRouter);
router.use("/watchlist", watchlistRouter);

export default router;
