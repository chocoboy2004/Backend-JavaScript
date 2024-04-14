import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { 
    createPlaylist,
    getUserPlaylists 
} from "../controllers/playlist.controller.js";

const router = Router()

router.route("/create").post(verifyJWT, createPlaylist)
router.route("/getPlaylists").get(verifyJWT, getUserPlaylists)

export default router