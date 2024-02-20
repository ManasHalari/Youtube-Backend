import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import  emailValidator from "email-validator"
import { User } from "../models/yt/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import mongoose from "mongoose";
import jwt  from 'jsonwebtoken'

const generateAccessAndRefereshTokens = async(userId) =>{
    //why try catch? bcz there is so many DB calls it could be possible that it can fail
    try {
        //    we need to store refreshToken in DB so we take user and we save that vaue after words
       const user= await User.findOne(userId)
    
       // User no user bcz that info. wi fetch by these tokens
       const accessToken=user.generateAccessToken()
       //recovering mistake of generateRefreshToken
       const refreshToken=user.generateRefreshToken()
    
       // save refreshToken in DB
        user.refreshToken=refreshToken;
    
        //User.save == no
        //user.save ==yes bcz we are saving that user vaue not mode 
        await user.save({ validateBeforeSave: false })
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

export const registerUser=asyncHandler(async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db and take that url from cloudinary
    // check for user creation
    // return res and remove password and refresh token field from response

    // get user details 
    const {fullName, email, username, password } = req.body
    // console.log(email)
    if (
        [fullName, email, username, password].some((field) => field?.trim === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check  email
    const validEmail=emailValidator.validate(email);
    if (!validEmail) {
        throw new ApiError(400, "Email is Incorect")
    }

    // check password
    const passwordRegEx=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    const validPassword=passwordRegEx.test(password);
    if (!validPassword) {
        throw new ApiError(400, "at least 8 characters /n must contain at least 1 uppercase letter/n 1 lowercase letter/n and 1 number/n Can contain special characters")
        
    }

     // check if user already exists: username, email
     const userExist=await User.findOne({
         $or:[{username},{email}]
        })
        if(userExist){
            throw new ApiError(409,"This username/email Exist.")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;
        // const coverImageLocalPath = req.files?.coverImage[0]?.path;
        let coverImageLocalPath;

        //if there is files and there is array and array length must be greater than 0
            if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
                 coverImageLocalPath = req.files.coverImage[0].path
            }

        if (!avatarLocalPath) {
            throw new ApiError(400,"Avatar is required")
        }
        // console.log("fi:",req.files)
        // upload them to cloudinary, avatar
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        // check avatar is uploaded on cloudinary bcz it isn't DB fatega
        if (!avatar) {
            throw new ApiError(400, "Avatar file is required")
        }

        // create user object - create entry in db and take that url from cloudinary
        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email, 
            password,
            username: username.toLowerCase()
        })

    // return res and remove password and refresh token field from response
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        // check for user creation
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        // send data
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )   
    

})

export const loginUser=asyncHandler(async (req,res)=>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    // req body -> data
    const {email, username, password} = req.body
    // console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    // check  email
    const validEmail=emailValidator.validate(email);
    if (!validEmail) {
        throw new ApiError(400, "Email is Incorect")
    }

    // check password
    const passwordRegEx=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    const validPassword=passwordRegEx.test(password);
    if (!validPassword) {
        throw new ApiError(400, "at least 8 characters /n must contain at least 1 uppercase letter/n 1 lowercase letter/n and 1 number/n Can contain special characters")
        
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)
   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
                        }

     const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    
     //we are making one more DB call bcz value of user is updated so refresh Token is new so we are making new call and  don't send password and refreshToken
     const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
        )

     const options = {
        httpOnly: true,
        secure: true
    }

    loggedInUser.refreshToken=refreshToken
    await loggedInUser.save({validateBeforeSave:false})

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

export const logoutUser=asyncHandler(async (req,res)=>{
    //taking user id from middleware if user exits
    //we have stored refresh token so unset it
    //clear cookies

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
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
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
    // taking refresh token
    // decode that token with secret key
    // check that it is vaid user or not
    //if it is vaid user than create AccessToken and RefreshToken
    //save new RefreshToken in DB

    // taking refresh token
    const incomingRefreshToken = req?.cookies?.refreshToken || req?.body?.refreshToken
    
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
    
    try {
         // decode that token with secret key which ony contains _id
        const decodedToken =  jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
         
        if (!decodedToken) {
            throw new ApiError(500, "refresh token is not decoded")
        }

        const user = await User.findById(decodedToken?.id)
        
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        // in DB and aso user contains same cookie
        
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
        
        //save new RefreshToken in DB
        console.log("a:",accessToken,"b:",newRefreshToken)

        user.refreshToken=newRefreshToken
        await user.save({validateBeforeSave:false})
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }


})

export const changeCurrentPassword = asyncHandler(async(req, res) => {
    //first we check user is authenticate or not from that we we get _id
    //take email and old password and new password from body
    //check if user with email and password is available 
    //if user exists then change the password

    const {old_password,new_password}=req.body;

    if (
        [old_password,  new_password].some((field) => field?.trim === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check password
    const passwordRegEx=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    const validPassword=passwordRegEx.test(new_password);
    if (!validPassword) {
        throw new ApiError(400, "new password must contain at least 8 characters /n must contain at least 1 uppercase letter/n 1 lowercase letter/n and 1 number/n Can contain special characters")
        
    }
    const user = await User.findById(req.user?._id)
    //check if password is valid or not
    const isPasswordValid=await user.isPasswordCorrect(old_password)

    if (!isPasswordValid) {
        throw new ApiError(400,"Password is incorrect")
    }

    user.password=new_password
    //validateBeforeSave is imp that indicates that you don't need to check 
    //validate other factors just do what i have tell you
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

export const getUser=asyncHandler(async(req, res) => {

    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Here's your details" ))
})

export const updateAccountDetails = asyncHandler(async(req, res) => {
    //get details from req.body and name must be same which we put in DB otherwise when we save this thing it wi be a probem
    const {username,email}=req.body;

    if (
        [username, email].some((field) => field?.trim === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check  email
    const validEmail=emailValidator.validate(email);
    if (!validEmail) {
        throw new ApiError(400, "Email is Incorect")
    }

    const newUser=await User.findByIdAndUpdate(
        req.user?._id,
        {
            // here you must know that name of you write beow and name in DB name must be same otherwise things wi nt be updated
            username,
            email
        },
        {
            // this for getting new info. fro DB
            new:true
        }
        ).select("-password  -refreshToken")

        if (!newUser) {
            throw new ApiError(500, "can't create user")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(200,newUser,"Here's your details" ))
})

export const updateUserAvatar = asyncHandler(async(req, res) => {
        //we get avatar path so put it on cloudinary
        //if avatar is upladed then give error
        //save that avatar ur in DB
        //otherwise give response
            // TODO: delete old image - assignment
            // we need to make utility functon which will delete the image on cloudinary

        // only one file is coming so don't write files it is only file in register we are taking two files so we write files
        const avatarLocalPath=req.file?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required")
        }

        const avatar=uploadOnCloudinary(avatarLocalPath)

        //don't forget that you must not send password and refreshToken
        const newUser=await User.findOneAndUpdate(
            req.user?._id
            ,
            {
                avatar:avatar.url
            },
            {
                new:true
            }
            ).select("-password  -refreshToken")

        if (!newUser) {
            throw new ApiError(400, "User is not created")
        }

        return res
    .status(200)
    .json(new ApiResponse(200,newUser,"Here's your details" ))
})

export const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
           
                coverImage: coverImage.url
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

export const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (username?.trim()=="") {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            //performing left outer join bcz we want user's details too and that can be happen by lookup

            //for finding channel's subscribers
            $lookup: {
                from:"subscriptions",
                //from this field we are performing join with the foreignField
                localField: "_id",
                 // we are finding localfield in forignfield that this thing exist or not 
                foreignField:"channel",
                as:"myTotalSubscribers"
            }
        },
        {
            $lookup: {
                //for finding that which channel's are subscribed by that channel
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$myTotalSubscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$myTotalSubscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])
    console.log(channel)
    if (!channel) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

export const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
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
                //sub-pipeline is required bcz it has owner field which is dependent on user model
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
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            //we get array and we want first element from that
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})