import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
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

export {
    toggleSubscription
}