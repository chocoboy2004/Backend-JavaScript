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

export {
    createPlaylist,
    getUserPlaylists
}
