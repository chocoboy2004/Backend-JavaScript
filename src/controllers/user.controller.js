import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const getUser = await User.findById(userId);
        const accessToken = getUser.generateAccessToken()
        const refreshToken = getUser.generateRefreshToken()

        getUser.refreshToken = refreshToken
        await getUser.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
        
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating access and refresh token');
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    /*
    1. Take data from req.body
    2. Check for username or email
    3. Find user, if user is not present, give an error message
    4. If user is present, check for the password
    5. Generate access and refresh token and sent it to the user
    6. Send secure cookies

    */


    // 1.
    const {username, email, password} = req.body
    if (!username && !email) {
        throw new ApiError(400, 'Username or Email is required');
    }

    if (password === '') {
        throw new ApiError(400, 'Password is required');
    }


    // 3.
    const user =  await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user) {
        throw new ApiError(404, 'User not found');
    }


    // 4. 
    // const isValidPassword = await user.isPasswordCorrect(password);
    // if (!isValidPassword) {
    //     throw new ApiError(401, 'Invalid password')
    // }
    const isValidPassword = await bcrypt.compare(password, user.password)  // point 4 is updated
    if (!isValidPassword) {
        throw new ApiError(401, 'Invalid password')
    }


    // 5.
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);


    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');


    const options = {
        httpOnly: true,
        secure: true
    };


    return res
    .status(201)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: accessToken, refreshToken, loggedInUser
            },
            'User logged in successfully'
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(201)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(
        new ApiResponse(
            200,
            {},
            'User logged out successfully !'
        )
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // For re-generating the access token, we have to follow the below steps

    // 1. Take the refreshToken
    const incomingRefreshToken = req.cookie?.refreshToken || req.body?.refreshToken

    // 2. check for refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(404, 'Unauthorized refresh token')
    }

    // 3. Verify for refresh token ... basically we will check if the refresh token is valid or not
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    // 4. Get the refresh token details ... basically user details
    const user = await User.findById(decodedToken?._id)
    if (!user) {
        throw new ApiError(404, 'Unauthorized refresh token')
    }

    // 5. Check if incomingRefreshToken and user's refresh token is same or ... not
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(404, 'Either refresh token is expired or used')
    }

    // 6. After completing all checks, simply generate the new access and refresh tokens
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    // return the response and also the cookie
    return res
    .status(201)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                accessToken, refreshToken: newRefreshToken
            },
            'Access and Refresh tokens are successfully generated'
        )
    )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // ** user is already logged in and now I want to change my existing password with a new password
    // ** Follow the below steps for doing this
    /*
    1. take oldPassword, newPassword and confirmPassword from user
    2. check any field is empty or not
    3. if any field is empty, simply throw an error. Otherwise jump to the next step.
    4. check newPassword and confirmPassword are same or not.
    5. if they are equal, jump to the next step. Otherwise throw an error.
    6. fetch the user details from the database(req.user).
    7. check user's password and oldPassword are same or not.
    8. if they are same, jump to the next step. Otherwise throw an error 
    9. set the password with newPassword and save it to the database
    10. simply return a response to the user
    */

    const { oldPassword, newPassword, confirmPassword } = req.body
    if ([oldPassword, newPassword, confirmPassword].some((field) => field?.trim() === '')) {
        throw new ApiError(404, 'All fields are required')
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(404, 'newPassword and confirmPassword are different')
    }

    const user = await User.findById(req.user._id)
    const isCorrectPassword = await bcrypt.compare(oldPassword, user.password)
    if (!isCorrectPassword) {
        throw new ApiError(404, 'Old password is incorrect')
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(201)
    .json(new ApiResponse(200, {}, 'Password updated successfully'))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.user._id)
    if (!currentUser) {
        throw new ApiError(404, 'There is no current user')
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            currentUser,
            'Current user is fetched'
        )
    )
})

const changeFullnameAndEmail = asyncHandler(async (req, res) => {
    /*
    1. take fullname and email from req.body
    2. check for username and email
    3. fetch the current user
    4. set new username and email
    5. return response
    */

    const {fullname, email} = req.body
    if (!fullname && !email) {
        throw new ApiError(400, 'please fill the fields')
    }
    if ([fullname, email].some((field) => field?.trim() === '')) {
        throw new ApiError(400, 'Fill all the fields carefully')
    }

    // const user = await User.findById(req.user._id)
    // if (!user) {
    //     throw new ApiError(400, 'You are not logged in')
    // }

    // user.fullname = fullname
    // user.email = email
    // user.save({ validateBeforeSave: false })

    // const updatedUser = await User.findById(user._id).select('-password -refreshToken')

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true
        }
    ).select('-password -refreshToken')

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            updatedUser,
            'User updated successfully'
        )
    )
})

const updateImages = asyncHandler(async (req, res) => {
    /*
    1. take avatar and coverImage from multer. You can change any one of two images
    2. check if two images are present or not
    3. if not, throw an error. Otherwise jump onto the next step
    4. upload images on cloudinary, and check for the images
    5. update those images in user profile
    6. return the response
    */

    let newAvatarLocalPath
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        newAvatarLocalPath = req.files.avatar[0].path
    }
    let newCoverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        newCoverImageLocalPath = req.files.coverImage[0].path
    }
    if (!newAvatarLocalPath && !newCoverImageLocalPath) {
        throw new ApiError(400, 'You have to filled at least one field')
    }

    const newAvatar = await uploadOnCloudinary(newAvatarLocalPath)
    const newCoverImage = await uploadOnCloudinary(newCoverImageLocalPath)
    if (!newAvatar && !newCoverImage) {
        throw new ApiError(400, 'You have to fill at least one field')
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: newAvatar?.url,
                coverImage: newCoverImage?.url
            }
        },
        {
            new: true
        }
    ).select('-password -refreshToken')

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            updatedUser,
            'Images are updated'
        )
    )
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    // 1. get user channel profile
    const {username} = req.params

    // 2. check user profile is there or not. If not, just throw an error
    if (!username?.trim()) {
        throw new ApiError(400, "User profile is not available")
    }

    // 3. start writing aggregation pipeline
    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelSubscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullname: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1
                }
            }
        ]
    )
    console.log(channel)

    if (!channel?.length) {
        throw new ApiError(404, "User profile is not exists")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            channel[0],
            "User channel profile fetched"
        )
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullname: 1,
                                            username: 1,
                                            avatar: 1,
                                            coverImage: 1
                                        }
                                    },
                                    {
                                        $addFields: {
                                            owner: {
                                                $arrayElemAt: ["$owner", 0]
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    )

    return res
    .status(201)
    .json(
        new ApiError(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    changeFullnameAndEmail,
    updateImages,
    getUserChannelProfile,
    getWatchHistory
}