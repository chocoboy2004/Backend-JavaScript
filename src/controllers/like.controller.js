import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    // const {videoId} = req.params
    //TODO: toggle like on video
    res.send(
        {
            message: "ok"
        }
    )
})

export {
    toggleVideoLike
}