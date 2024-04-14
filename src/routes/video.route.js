import { Router } from "express";
import { 
    publishVideo,
    getVideoId,
    updateVideo,
    deleteVideo,
    getAllVideos
} from "../controllers/video.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router()
router.use(verifyJWT)

router.route("/upload").post(
    verifyJWT,
    upload.fields(
        [
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]
    ),
    publishVideo
)
router.route("/find/:videoId")
.get(getVideoId)
.patch(upload.fields([{name: "thumbnail", maxCount: 1}]), updateVideo)

router.route("/delete/:videoId").delete(verifyJWT, deleteVideo)
router.route("/getVideos").get(verifyJWT, getAllVideos)

export default router