import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    // Get user details from frontend
    const {fullname, email, username, password} = req.body
    console.log("fullname: ", fullname);
    // console.log("email: ", email);
    // console.log("username: ", username);
    // console.log("password: ", password);


    // Check validation - not empty
    // if (fullname === '') {
    //     throw new ApiError(404, 'fullname is required');
    // }
    if (
        [fullname, email, username, password].some((filed) => filed?.trim() === '')
    ) {
        throw new ApiError(404, 'All the fields are required')
    }


    // Check whether user is exist or not - username, email
    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, 'User is already exist');
    }


    // Check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is required');
    }


    // Upload them to cloudinary, check for avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, 'Avatar is required');
    }


    // create user object - entry in db
    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        avatar: avatar.url, 
        coverImage: coverImage?.url || ' ',
        password
    });


    // remove password and refresh token field from the response
    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );


    // Check for user creation
    if (!createdUser) {
        throw new ApiError(500, 'Something Went Wrong');
    }


    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User crreated successfully')
    );
});

export default registerUser;