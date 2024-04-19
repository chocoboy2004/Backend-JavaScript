import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Like from "../models/likes.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    /*
    1. take videoId from req.params
    2. check if Id is passed in req.params
    3. If not passed, throw an error.
    4. check the videoId is valid or not. If not, throw an error.
    5. check if the videoId is already in likes collection or not.
    6. If the videoId is present, just delete the like document where the videoId is present and return a response.
    7. If the videoId is not present, create a new like document and return a response.
    */
    const {videoId} = req.params
    if (!videoId) {
        throw new ApiError(404, "Video ID is required")
    }

    const validId = isValidObjectId(videoId)
    if (!validId) {
        throw new ApiError(404, "Invalid video ID")
    }

    try {
        const existDocument = await Like.findOne(
            {
                video: videoId,
                likedBy: req.user._id
            }
        )

        if (!existDocument) {
            const like = await Like.create(
                {
                    video: videoId,
                    likedBy: req.user._id
                }
            )

            return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    like,
                    "You liked this video successfully"
                )
            )
        } else {
            const deletedDocument = await Like.findByIdAndDelete(existDocument._id)
            return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    deletedDocument,
                    "You unliked this video successfully"
                )
            )
        }
    } catch (error) {
        console.error(`Problem occured in try block: ${error}`)
        process.exit(1)
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    /*
    1. take commentId from req.params
    2. check if Id is passed in req.params
    3. If not passed, throw an error.
    4. check the commentId is valid or not. If not, throw an error.
    5. check if the commentId is already in likes collection or not.
    6. If the commentId is present, just delete the like document where the videoId is present and return a response.
    7. If the commentId is not present, create a new like document and return a response.
    */
   const {commentId} = req.params
   if (!commentId) {
       throw new ApiError(404, "Comment ID is required")
   }

   const isValidId = isValidObjectId(commentId)
   if (!isValidId) {
       throw new ApiError(404, "Invalid comment ID")
   }

   try {
       const existedDocument = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user._id
        }
       )

       if (!existedDocument) {
        const like = await Like.create(
            {
                comment: commentId,
                likedBy: req.user._id
            }
        )

        return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                like,
                "You liked this comment successfully"
            )
        )
       } else {
        const deletedDocument = await Like.findByIdAndDelete(existedDocument._id)
        return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                deletedDocument,
                "You unliked this comment successfully"
            )
        )
       }
   } catch (error) {
       console.error(`Error cooured in try block: ${error}`)
       process.exit(1)
   }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    /*
    1. take tweetId from req.params
    2. check if Id is passed in req.params. If not passed, throw an error
    3. check the tweetId is valid or not. If not, throw an error.
    4. check if the tweetId is already in likes collection or not.
    5. If the tweetId is present, just delete the like document where the tweetId is present and retrun a response.
    6. If the tweetId is not present, create a new like document and return a response
    */
    const {tweetId} = req.params
    if (!tweetId) {
        throw new ApiError(404, "tweetId is required")
    }

    const validId = isValidObjectId(tweetId)
    if (!validId) {
        throw new ApiError(404, "Invalid tweetId")
    }

    try {
        const existedDocument = await Like.findOne(
            {
                tweet: tweetId,
                likedBy: req.user._id
            }
        )

        if (!existedDocument) {
            const like = await Like.create(
                {
                    tweet: tweetId,
                    likedBy: req.user._id
                }
            )
            return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    like,
                    "You likes this tweet successfully"
                )
            )
        } else {
            const deletedDocument = await Like.findByIdAndDelete(existedDocument._id)
            return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    deletedDocument,
                    "You unliked0 this tweet successfully"
                )
            )
        }
    } catch (error) {
        console.error(`Error is occured in try block: ${error}`)
        process.exit(1)
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const videos = await Like.aggregate(
        [
            {
              $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id)
              }
            },
            {
              $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
              }
            },
            {
              $addFields: {
                videoDetails: "$videoDetails"
              }
            },
            {
              $unwind: "$videoDetails"
            },
            {
              $project: {
                _id: 1,
                video: {
                  _id: "$videoDetails._id",
                  videoFile: "$videoDetails.videoFile",
                  thumbnail: "$videoDetails.thumbnail",
                  title: "$videoDetails.title",
                  description: "$videoDetails.description",
                  views: "$videoDetails.views",
                  isPublished: "$videoDetails.isPublished",
                  owner: "$videoDetails.owner"
                }
              }
            }
          ]
    )

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            videos,
            "Liked videos are fetched successfully"
        )
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}