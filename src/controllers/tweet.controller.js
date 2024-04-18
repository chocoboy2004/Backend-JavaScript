import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Tweet from "../models/tweets.model.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    res.send(
        {
            message: "OK"
        }
    )
})

export {
    createTweet
}