import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
// importing upload for file handling
import upload from "../middlewares/multer.middleware.js";
import { loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
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

export default router;