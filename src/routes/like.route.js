import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { 
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
} from "../controllers/like.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/toggleVideoLike/:videoId").post(toggleVideoLike)
router.route("/toggleCommentLike/:commentId").post(toggleCommentLike)
router.route("/toggleTweetLike/:tweetId").post(toggleTweetLike)
router.route("/likedVideos").get(getLikedVideos)

export default router