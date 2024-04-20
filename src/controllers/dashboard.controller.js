import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";


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

export {
    getChannelVideos
}