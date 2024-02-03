import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/yt/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/yt/user.model.js";

export const getUserTweets = asyncHandler(async (req, res) => {
    // we will get any user_id 
    //first check in User DB that user exists
    //if exists then match that userId with in Tweet model
    //display details of that tweet

    const {userId}=req.params;
    const {page=1,limit=10}=req.query
    
    if (!userId) {
        throw new ApiError(404, "userId is required");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "userId is not vaid");
    }

    const userExists=await User.findById(userId)

    if (!userExists) {
        throw new ApiError(404, "User do not exist");
    }

    const getTweets=await Tweet.aggregate([
        {
            $match: {
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        
    ])

    if (!getTweets) {
        throw new ApiError(404, "Tweets do not exist");
    }

    const options={
        limit: parseInt(limit),
        page:parseInt(page)
    }

    const resultedTweets= await Tweet.aggregatePaginate(
        getTweets,
        options
      );
    
      if (resultedTweets.totalDocs === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "user has no video"));
      }

    return res
    .status(201)
    .json(new ApiResponse(200, resultedTweets, "Tweets fetched successfully"));
})

export const createTweet = asyncHandler(async (req, res) => {
    //we get tweet from req.body
    //verify that we got a fied or not
    //if we get tweet then create a document in Tweet DB

    const {tweet}=req.body;

    if (!tweet) {
        throw new ApiError(404, "tweet not found");
    }

    const createdTweet=await Tweet.create({
        content:tweet,
        owner:req.user.id
    })

    if (!createdTweet) {
        throw new ApiError(404, "tweet not created");
    }
    
    return res
    .status(201)
    .json(new ApiResponse(200, createdTweet, "Tweet created successfully"));
})

export const updateTweet = asyncHandler(async (req, res) => {
    //we get tweetId from req.params and new_tweet from req.body
    //verify that we have both fieds or not
    //find that id in tweet DB 
    //if we find tweet update it otherwise just throw error

    const {tweetId}=req.params;
    const {new_tweet} = req.body;

    if (!tweetId) {
        throw new ApiError(404, "tweetId is not required");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "tweetId is not vaid");
    }

    if (new_tweet.trim()==="") {
        throw new ApiError(404, "new_tweet cannot be empty");
    }

    //it can possible that user can't be authenticated we must keep in that mind only that we must check owner and tweetId
    let tweet = await Tweet.findOne({
        $and:[
            {"owner":req.user._id},
            {"_id":tweetId}
        ]
    })

    if (!tweet) {
        throw new ApiError(404, "User is not Authenticated or this tweetId is not present in DB");
    }

    const updatedTweet=await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{content:new_tweet}
        },
        {
            new:true
        }
    )

    if (!updatedTweet) {
        throw new ApiError(404, "new_tweet cannot be created");
    }

    return res
    .status(201)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
})

export const deleteTweet = asyncHandler(async (req, res) => {
    //first we get tweeetId verify that
    //then we check in DB that tweetId exists and it is delete that

    const {tweetId}=req.params;

    if (!tweetId) {
        throw new ApiError(404, "tweetId is not required");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "tweetId is not vaid");
    }

    const deletedTweet=await Tweet.findByIdAndDelete(
        tweetId,
    )

    if (!deletedTweet) {
        throw new ApiError(404, "tweetId is not deleted");
    }

    return res
    .status(201)
    .json(new ApiResponse(200,  "Tweet deleted successfully"));
})