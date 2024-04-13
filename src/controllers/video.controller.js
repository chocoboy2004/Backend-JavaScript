import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";

const publishVideo = asyncHandler(async(req, res) => {
    /*
    1. take title, description from req.body
    2. check any field is empty or not
    3. take the video, thumbnail using multer
    4. check if they are present or not
    5. upload them on the cloudinary
    6. calculate the video length
    7. create video object
    8. return response

    */

    const {title, description } = req.body
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and description needed")
    }

    if (!title || !description) {
        throw new ApiError(400, "Title and description needed")
    }

    let videoFileLocalPath, thumbnailLocalPath
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFileLocalPath = req.files.videoFile[0].path
    }
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path
    }
    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail are required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!videoFile ||!thumbnail) {
        throw new ApiError(400, "Video and thumbnail are required")
    }

    const video = await Video.create(
        {
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title: title.trim(),
            description: description.trim(),
            duration: videoFile.duration,
            owner: req.user._id
        }
    )

    const instance = await Video.findById(video._id)
    if (!instance) {
        throw new ApiError(500, "Something went wrong while creating video instance")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            instance,
            "Video has successfully uploaded"
        )
    )
})

const getVideoId = asyncHandler(async(req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Title is required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Video is not available")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            video,
            "Video fetched"
        )
    )
})

export {
    publishVideo,
    getVideoId
}