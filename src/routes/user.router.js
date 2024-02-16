import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
// importing upload for file handling
import upload from "../middlewares/multer.middleware.js";

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
    ], registerUser)
);

export default router;