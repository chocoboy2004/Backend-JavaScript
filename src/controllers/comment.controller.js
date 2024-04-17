import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import Comment from "../models/comments.model.js";

const addComment = asyncHandler(async(req, res) => {
    // TODO: add a comment to a video
    /*
    1. pass the video ID for which to add the comment in req.params
    2. check ID is successfully get or not.
    3. take content from req.body
    4. check content is present or not.
    5. create comment
    6. return a response
    */

    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const videoStatus = await Video.findById(videoId)
    if (!videoStatus) {
        throw new ApiError(400, "Video is not exists")
    }

    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create(
        {
            content: content.trim(),
            video: videoStatus._id,
            owner: req.user._id
        }
    )

    const createdComment = await Comment.findById(comment._id)
    if (!createdComment) {
        throw new ApiError(500, "Something went wrong while creating a comment")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            createdComment,
            "Comment is posted successfully"
        )
    )
})

export {
    addComment
}