import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { 
    createTweet 
} from "../controllers/tweet.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/create").post(createTweet)

export default router