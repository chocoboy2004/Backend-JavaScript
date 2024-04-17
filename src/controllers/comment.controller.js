import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const addComment = asyncHandler(async(req, res) => {
    res.send(
        {
            message: "ok"
        }
    )
})

export {
    addComment
}