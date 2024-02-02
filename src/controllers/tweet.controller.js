import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/yt/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


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