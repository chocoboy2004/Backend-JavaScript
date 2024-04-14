import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";

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

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    /*
    1. Take the video ID from params
    2. check whether the id is valid or not. If not, through an ERROR
    3. check whether the video is owned by the user or not. If not, through an ERROR
       -- compare owner and req.user._id
       -- if not matched, throw an ERROR
    4. take title, description from req.body and thumbnail using multer.
    5. check title, descriptions are empty or not.
    6. check the thumbnail.
    7. upload thumbnail to the cloudinary and check for upload progress.
    8. update the video details in to the database.
    9. return a response to the database.
    */

    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const videoStatus = await Video.findById(videoId)
    if (!videoStatus) {
        throw new ApiError(400, "Video is not exists")
    }

    // console.log(videoStatus.owner)
    // console.log(req.user._id)

    // if (videoStatus.owner = req.user._id) {
    //     throw new ApiError(404, "Invalid owner")
    // }

    const {title, description} = req.body
    if (!title && !description) {
        throw new ApiError(400, "Title or Description is required")
    }

    let thumbnailLocalPath
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Missing")
    }
    
    const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
    await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title?.trim(),
                description: description?.trim(),
                thumbnail: newThumbnail?.url
            }
        },
        {
            new: true
        }
    )

    const updateVideoDetails = await Video.findById(videoId)

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                _id: updateVideoDetails._id,
                title: updateVideoDetails.title,
                description: updateVideoDetails.description,
                thumbnail: updateVideoDetails.thumbnail,
                owner: updateVideoDetails.owner
            },
            "Video details are updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    /*
    1. get the video ID from req.params
    2. check id is received or not
    3. if not received, throw an error
    4. simply delete that document using the ID
    5. return a response to the user.
    */

    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }
    console.log(videoId)

    await Video.findByIdAndDelete(videoId)

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {},
            "Video is deleted successfully"
        )
    )
})

const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    /*
    1. take query, sortBy, sortType from req.query
    2. check any field is empty or not.
    3. If any field is empty, simply throw an error
    4. write a aggregation pipeline for retrieving video details
    5. return the res
    */

   const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
   if (
    [query, sortBy, sortType].some((field) => field?.trim() === "")
   ) {
    throw new ApiError(404, "All details are required")
   }

   let aggregationPipeline = []

   if (!query) {
    throw new ApiError(404, "Query is required")
   }
   aggregationPipeline.push(
    {
        $match: {
            title: {
                $regex: query,
                $options: "i"
            }
        }
    },
    {
        $project: {
            title: 1,
            description: 1,
            videoFile: 1,
            thumbnail: 1,
            createdAt: 1,
            owner: 1
        }
    }
   )

   let sortOrder

   if (!sortBy || !sortType) {
    throw new ApiError(404, "Sort by and sort type are required")
   } else {
    if (sortType === "asc" || "1") {
        sortOrder = 1
    } else if (sortType === "desc" || "-1") {
        sortOrder = -1
    } else {
        throw new ApiError(404, "SortBy will be either asc or desc")
    }
   }

   aggregationPipeline.push(
    {
        $sort: {
            sortBy: sortOrder
        }
    }
   )
   

   const video = await Video.aggregate(
    aggregationPipeline,
    limit,
    page
   )

   if (!video) {
    throw new ApiError(404, "something went wrong while aggregating video")
   }

   return res
   .status(201)
   .json(
    new ApiResponse(
        200,
        video,
        "Videos are fetched successfully"
    )
   )
})

export {
    publishVideo,
    getVideoId,
    updateVideo,
    deleteVideo,
    getAllVideos
}