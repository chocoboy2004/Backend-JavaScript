import mongoose from 'mongoose';
import {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new Schema({
    videoFile: {
        type: String,  // cloudinary url
        required: [true, 'video file is required']
    },
    thumbnail: {
        type: String,  // cloudinary url
        required: [true, 'thumbnail is required']
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'owner is required']
    },
    title: {
        type: String,
        required: [true, 'thumbnail is required']
    },
    description: {
        type: String
    },
    duration: {
        type: Number,  // cloudinary 
        required: [true, 'video duration is required']
    },
    views: {
        type: Number,
        required: [true, 'views is required'],
        default: 0
    },
    isPublished: {
        type: Boolean,
        required: [true, 'It is a required field'],
        default: true
    }
}, {timestamps: true});

const Video = mongoose.model('Video', videoSchema);
videoSchema.plugin(mongooseAggregatePaginate);

export {Video};