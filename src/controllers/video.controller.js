import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const publishVideo = asyncHandler(async(req, res) => {
    res.send(
        {
            message: "Ok"
        }
    )
})

export {
    publishVideo
}