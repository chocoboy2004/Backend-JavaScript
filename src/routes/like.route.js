import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { 
    toggleVideoLike,
    toggleCommentLike
} from "../controllers/like.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/toggleVideoLike/:videoId").post(toggleVideoLike)
router.route("/toggleCommentLike/:commentId").post(toggleCommentLike)

export default router