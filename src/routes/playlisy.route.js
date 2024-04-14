import { Router } from "express";
import { 
    createPlaylist 
} from "../controllers/playlist.controller.js";

const router = Router()

router.route("/create").get(createPlaylist)

export default router