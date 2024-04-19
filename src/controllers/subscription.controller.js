import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    // const {channelId} = req.params
    // TODO: toggle subscription
    res.send(
        {
            message: "ok"
        }
    )
})

export {
    toggleSubscription
}