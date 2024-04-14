import { Router } from "express";
import { 
    publishVideo,
    getVideoId,
    updateVideo,
    deleteVideo,
    getAllVideos,
    togglePublishStatus
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
.put(togglePublishStatus)

router.route("/delete/:videoId").delete(verifyJWT, deleteVideo)
router.route("/getVideos").get(verifyJWT, getAllVideos)

// router.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default router