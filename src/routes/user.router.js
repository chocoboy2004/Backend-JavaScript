import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
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
    getUserChannelProfile
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
router.route('/current-user').post(verifyJWT, getCurrentUser)
router.route('/change-details').post(verifyJWT, changeFullnameAndEmail)
router.route('/update-images').post(
    verifyJWT,
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    updateImages
)
router.route("/getUserChannelProfile").post(verifyJWT, getUserChannelProfile)

export default router;