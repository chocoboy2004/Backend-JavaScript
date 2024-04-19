import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    /*
    1. take channelId from req.params
    2. check if ID is passed into req.params. If not passed, throw an error
    3. check if the channelId is valid or not. If not, throw an error.
    4. check if the channelId is already in subscriptions collection or not.
    5. If not, just create a new subscription document with the channelId and return a response.
    6. Otherwise, simply remove the subscription document that contain the channelId from the subscription collection and return a response.
    */
    const {channelId} = req.params
    if (!channelId) {
        throw new ApiError(404, "channelId is required")
    }

    const validId = isValidObjectId(channelId)
    if (!validId) {
        throw new ApiError(404, "Invalid channelId")
    }

    try {
        const existedDocument = await Subscription.findOne(
            {
                subscriber: req.user._id,
                channel: channelId
            }
        )

        if (!existedDocument) {
            const subscription = await Subscription.create(
                {
                    subscriber: req.user._id,
                    channel: channelId
                }
            )
            return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    subscription,
                    "You have successfully subscribed"
                )
            )
        } else {
            const deletedDocument = await Subscription.findByIdAndDelete(existedDocument._id)
            return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    deletedDocument,
                    "You have successfully unSubscribed"
                )
            )
        }
    } catch (error) {
        console.error(`Error occured in try block: ${error}`)
        process.exit(1)
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!channelId) {
        throw new ApiError(404, "ChannelId is required")
    }

    const validId = isValidObjectId(channelId)
    if (!validId) {
        throw new ApiError(404, "Invalid channelId")
    }

    const subscribers = await Subscription.aggregate(
        [
            {
              $match: {
                channel: new mongoose.Types.ObjectId(channelId)
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
                $unwind: "$subscribers"
            },
            {
                $project: {
                  subscriber: 1,
                  "subscribers.username": 1,
                  "subscribers.fullname": 1,
                  "subscribers.avatar": 1
                }
            }
        ]
    )

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            subscribers,
            "Subscribers of this channel are fetched successfully"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers
}