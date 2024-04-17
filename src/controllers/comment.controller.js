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

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    /*
    1. pass commentId in req.params
    2. check ID is successfully get or not.
    3. If ID is not get, throw an error.
    4. fetch the comment details from the details using the videoId.
    5. If commentId is not present in the database, throw an error.
    6. take ownerId, req.user._id and compare it.
    7. If they both are not equal, throw an error.
    8. take content from req.body
    9. check content is present ot not. If not, throw an error.
    10. create a comment document.
    11. return a response
    */
    const { commentId } = req.params
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment is not exists")
    }
    if (!(comment.owner.toString() === req.user._id.toString())) {
        throw new ApiError(404, "You have no access to update this comment")
    }

    const { content } = req.body
    if (!content) {
        throw new ApiError(404, "Content is required")
    }
    
    const updateComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content.trim()
            }
        },
        {
            new: true
        }
    )

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            updateComment,
            "Comment is updated successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    /*
    1. take commentId from req.params. If ID is not there, throw an error.
    2. fetch the comment details from the database using the commentId.
    3. If comment document is not present into the DB, throw an error.
    4. check ower and req.user._id are same or not. If not, throw an error.
    5. delete the comment.
    6. return a response
    */

    const { commentId } = req.params
    if (!commentId) {
        throw new ApiError(404, "CommentId is required")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    if (!(comment.owner.toString() === req.user._id.toString())) {
        throw new ApiError(404, "Can't remove the comment! Unauthorized access")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {},
            "Comment is removed successfully"
        )
    )
})

export {
    addComment,
    updateComment,
    deleteComment
}