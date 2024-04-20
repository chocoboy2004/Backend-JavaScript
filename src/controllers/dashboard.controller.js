import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.model.js";
import Like from "../models/likes.model.js";


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channel = req.user._id
    console.log(channel)
    if (!channel) {
        throw new ApiError(404, "Please login first")
    }

    try {
        const videos = await Video.aggregate(
            [
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(channel)
                    }
                },
                {
                    $project: {
                        videoFile: 1,
                        thumbnail: 1,
                        title: 1,
                        description: 1,
                        owner: 1,
                        views: 1,
                        createdAt: 1
                    }
                }
            ]
        )

        if (videos.length > 0) {
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        200,
                        videos,
                        "Videos are fetched successfully"
                    )
                )
        } else {
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        200,
                        {
                            message: "There is no video available"
                        },
                        "Video are fetched successfully"
                    )
                )
        }
    } catch (error) {
        console.error(`Error occured in try block: ${error.message}`)
        process.exit(1)
    }
})

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channel = req.user._id
    if (!channel) {
        throw new ApiError(404, "Please login first")
    }

    try {
        const subscribers = await Subscription.aggregate(
            [
                {
                    $match: {
                        channel: new mongoose.Types.ObjectId(channel)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "subscriber",
                        foreignField: "_id",
                        as: "subscribers"
                    }
                },
                {
                    $addFields: {
                        subscribers: {
                            $size: "$subscribers"
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        subscribers: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        subscribers: 1
                    }
                }
            ]
        )
    
        const videos = await Video.aggregate(
            [
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(channel)
                    }
                },
                {
                    $project: {
                        videoFile: 1,
                        thumbnail: 1,
                        title: 1,
                        description: 1,
                        views: 1,
                        createdAt: 1,
                        owner: 1
                    }
                }
            ]
        )
    
        const totalLikes = await Like.aggregate(
            [
                {
                    $match: {
                        likedBy: new mongoose.Types.ObjectId(channel),
                        video: {
                            $exists: true
                        }
                    }
                },
                {
                    $lookup: {
                        from: "videos",
                        localField: "likedBy",
                        foreignField: "owner",
                        as: "result"
                    }
                },
                {
                    $group: {
                        _id: null,
                        likes: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        likes: 1
                    }
                }
            ]
        )
    
        const totalViews = await Video.aggregate(
            [
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(channel)
                    }
                },
                {
                    $group: {
                        _id: null,
                        views: {
                            $sum: "$views"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        views: 1
                    }
                }
            ]
        )
    
        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    {
                        subscribers: subscribers,
                        likes: totalLikes,
                        views: totalViews,
                        videos: videos
                    },
                    "Channel stats are fecthed"
                )
            )
    } catch (error) {
        console.error(`Error occured in try block: ${error.message}`)
        process.exit(1)
    }
})

export {
    getChannelVideos,
    getChannelStats
}