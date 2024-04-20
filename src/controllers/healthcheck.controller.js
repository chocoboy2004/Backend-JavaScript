import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const healthCheck = asyncHandler(async(req, res) => {
    try {
        return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                {
                    status: "Good"
                },
                "Success"
            )
        )
    } catch (error) {
        throw new ApiResponse(
            404,
            error.message
        )
    }
}) 

export {
    healthCheck
}