import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Tweet from "../models/tweets.model.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const user = req.user._id
    if (!user) {
        throw new ApiError(404, "Please login or signup")
    } 

    const { content } = req.body
    if (!content || content.length < 1) {
        throw new ApiError(404, "Content is required")
    }

    const tweet = await Tweet.create(
        {
            owner: user,
            content: content.trim()
        }
    )

    const createdTweet = await Tweet.findById(tweet._id)
    if (!createdTweet) {
        throw new ApiError(500, "Something went wrong while creating tweet")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            createdTweet,
            "Tweet is posted successfully"
        )
    )
})

export {
    createTweet
}