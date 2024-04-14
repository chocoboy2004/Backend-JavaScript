import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { 
    createPlaylist,
    getUserPlaylists ,
    getPlaylistById
} from "../controllers/playlist.controller.js";

const router = Router()

router.route("/create").post(verifyJWT, createPlaylist)
router.route("/getPlaylists").get(verifyJWT, getUserPlaylists)
router.route("/id/:playlistId").get(getPlaylistById)

export default router