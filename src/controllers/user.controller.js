import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    // Get user details from frontend  -- 1
    const {fullname, email, username, password} = req.body
    // console.log(req.body);
    // console.log("email: ", email);
    // console.log("username: ", username);
    // console.log("password: ", password);


    // Check validation - not empty  -- 2
    // if (fullname === '') {
    //     throw new ApiError(404, 'fullname is required');
    // }
    if (
        [fullname, email, username, password].some((field) => field?.trim() === '')
    ) {
        throw new ApiError(400, 'All the fields are required')
    }


    // Check whether user is exist or not - username, email  -- 3
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, 'User is already exist');
    }
    // console.log(req.files);

    // Check for images, check for avatar -- 4
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {  // checking for the files existence before giving path
        avatarLocalPath = req.files.avatar[0].path;
    } else {
        throw new ApiError(400, 'Avatar is required');
    }
    // if (!avatarLocalPath) {
    //     throw new ApiError(400, 'Avatar is required');
    // }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }



    // Upload them to cloudinary, check for avatar  -- 5
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, 'Avatar is required');
    }


    // create user object - entry in db  -- 6
    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        avatar: avatar.url, 
        coverImage: coverImage?.url || '',
        password
    });


    // remove password and refresh token field from the response  -- 7
    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );


    // Check for user creation  -- 8
    if (!createdUser) {
        throw new ApiError(500, 'Something Went Wrong');
    }
    // console.log(createdUser);


    // return response  -- 9
    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User crreated successfully')
    );

});

export default registerUser;