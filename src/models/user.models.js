import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        lowercase: true,
        unique: true,
        trim: true
    },
    fullname: {
        type: String,
        required: [true, 'Fullname is required'],
        trim: true,
        index: true
    },
    avatar: {  
        type: String,  // cloudinary url
        required: true
    },
    coverImage: {
        type: String,  // cloudinary
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
}, {timestamps: true});

userSchema.pre('save', async function(next) {  // Encripting Password
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    } else {
        next();
    }
});

userSchema.method.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

const User = mongoose.model('User', userSchema);

export default User;