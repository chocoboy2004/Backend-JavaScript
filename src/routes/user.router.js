import { Router } from "express";
import registerUser, { getWatchHistory } from "../controllers/user.controller.js";
// importing upload for file handling
import upload from "../middlewares/multer.middleware.js";
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    changeFullnameAndEmail,
    updateImages,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";


const router = Router();

router.route('/register').post(
    upload.fields([  // injecting middleware
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]), registerUser
);

router.route('/login').post(loginUser);

// secured route
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/change-details').patch(verifyJWT, changeFullnameAndEmail)
router.route('/update-images').patch(
    verifyJWT,
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    updateImages
)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/getWatchHistory").get(verifyJWT, getWatchHistory)

export default router;