import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { 
    createPlaylist,
    getUserPlaylists ,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist
} from "../controllers/playlist.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/create").post(verifyJWT, createPlaylist)
router.route("/getPlaylists").get(verifyJWT, getUserPlaylists)
router.route("/:playlistId/video/:videoId").patch(verifyJWT, addVideoToPlaylist)
router.route("/removeVideo/:playlistId/:videoId").delete(verifyJWT, removeVideoFromPlaylist)
router.route("/id/:playlistId").get(getPlaylistById).patch(updatePlaylist)
router.route("/delete/:playlistId").delete(deletePlaylist)

export default router