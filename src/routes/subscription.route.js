import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { 
    toggleSubscription,
    getUserChannelSubscribers 
} from "../controllers/subscription.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/toggleSubscription/:channelId").post(toggleSubscription)
router.route("/subscribersCount/:channelId").post(getUserChannelSubscribers)

export default router