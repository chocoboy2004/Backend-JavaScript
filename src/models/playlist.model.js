import mongoose, { Schema } from "mongoose"

const playlistSchema = new Schema(
    {
        playlistName: {
            type: String
        },
        description: {
            type: String
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

const Playlist = mongoose.model("Playlist", playlistSchema)

export default Playlist