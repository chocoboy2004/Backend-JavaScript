import { Router } from "express";
import { publishVideo } from "../controllers/video.controller.js";

const router = Router()

router.route("/upload").post(publishVideo)

export default router