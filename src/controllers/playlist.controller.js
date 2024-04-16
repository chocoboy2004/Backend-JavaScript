import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Playlist from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    /*
    1. take playlistName, description from req.body
    2. check any field is empty or not
    3. if empty, throw an error
    4. create playlist
    5. return a response
    */

    const {playlistName, description} = req.body
    if ([playlistName, description].some((field) => field?.trim() === "")) {
        throw new ApiError(404, "Playlist name & description is needed")
    }
    if (!playlistName || !description) {
        throw new ApiError(404, "Playlist name & description should be given")
    }
    
    const playlist = await Playlist.create(
        {
            playlistName: playlistName.trim(),
            description: description.trim(),
            owner: req.user._id
        }
    )

    const createdPlaylist = await Playlist.findById(playlist._id)
    if (!createdPlaylist) {
        throw new ApiError(500, "Something went wrong while creating the playlist")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            createdPlaylist,
            "Playlist is successfully created"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists

    const playlistDetails = await Playlist.aggregate(
        [
            {
                $match: {
                    owner: req.user._id
                }
            },
            {
                $project: {
                    playlistName: 1,
                    description: 1,
                    createdAt: 1
                }
            }
        ]
    )

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            playlistDetails,
            "User's all playlists are fetched successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id
    /*
    1. take playlistID from req.params
    2. check for the playlist ID
    3. if ID is not there, throw an error
    4. make a database call to fetch the playlist using the playlist ID
    5. check for the fetched data
    6. If data is not fecthed, throw an error
    7. return a response
    */
    const {playlistId} = req.params
    if (!playlistId) {
        throw new ApiError(404, "No ID is provided")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Invalid ID is provided! Please give a valid ID")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist is fetched successfully by using it's ID"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    /*
    1. take playlistId and videoId from req.params
    2. check playlistId and videoId are empty or not. If empty, throw an error.
    3. fetch the playlist and add videoId into the playlist
    4. return a response
    */
    const {playlistId, videoId} = req.params
    if (!playlistId || !videoId) {
        throw new ApiError(404, "Playlist ID and Video ID are required")
    }

    const addVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
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
            addVideo,
            "Video is added successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    /*
    1. take playlistId & videoId from req.params
    2. check playlistId & videoId are empty or not. If empty, throw an error.
    3. fetch and remove videoId from the playlist document.
    4. return a response.
    */
    const {playlistId, videoId} = req.params
    if (!playlistId || !videoId) {
        throw new ApiError(404, "PlaylistId & videoId is needed")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
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
            updatedPlaylist,
            "Video is successfully removed from the playlist"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    /*
    1. take the playlistId which you want to remove from the Playlist collection.
    2. check whether the given playlistId is empty or not.
    3. if empty, throw an error.
    4. check whether the Id is present in the Playlist collection or not. If not, throw an error.
    5. remove the playlistId from the Playlist collection
    6. return a response
    */
    const {playlistId} = req.params
    if (!playlistId) {
        throw new ApiError(404, "PlaylistId is required")
    }

    const {name, description} = req.body
    console.log(`
        ${name},
        ${description}
    `)
    if (!name && !description) {
        throw new ApiError(404, "Playlist name or description is required")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                playlistName: name,
                description: description
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
            updatedPlaylist,
            "Playlist is updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist
}
