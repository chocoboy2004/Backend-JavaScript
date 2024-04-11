import mongoose, { Schema } from "mongoose"

const tweetSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Tweet = mongoose.model("Tweet", tweetSchema)

export default Tweet