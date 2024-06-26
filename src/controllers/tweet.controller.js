import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Tweet from "../models/tweets.model.js";
import mongoose from "mongoose";

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

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(404, "Tweet ID is required")
    }

    const isExist = await Tweet.findById(tweetId)
    if (!isExist) {
        throw new ApiError(404, "Tweet is not exists")
    }
    if (!(isExist.owner.toString() === req.user._id.toString())) {
        throw new ApiError(404, "You have no access to update this tweet")
    }

    const { newContent } = req.body
    if (!newContent || newContent.length < 1) {
        throw new ApiError(404, "Content is required")
    }

    isExist.content = newContent
    await isExist.save({ validateBeforeSave: false })

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {},
            "Tweet is updated successfully"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if(!tweetId) {
        throw new ApiError(404, "Tweet ID is required")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Invalid tweet ID")
    }
    if (!(tweet.owner.toString() === req.user._id.toString())) {
        throw new ApiError(404, "You have no access to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const user = req.user._id
    if (!user) {
        throw new ApiError(404, "Please login or signup")
    }

    const listOfTweets = await Tweet.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(user)
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $limit: 15
            },
            {
                $project: {
                    owner: 1,
                    content: 1
                }
            }
        ]
    )

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            listOfTweets,
            "Tweets are fetched successfully"
        )
    )
})

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}