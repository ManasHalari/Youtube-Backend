import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/yt/subscription.model.js";
import { User } from "../models/yt/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const toggleSubscription = asyncHandler(async (req, res) => {
    //toggle mean if it is subscribe then unsubscibe and if it is unsubscribe then subscribe
    //here we get userId from req.params._id we check that in Subscriber DB there is any document like who has both this subscriber and channel 
    //if there is then remove it
    //if not then create it

    const {channelId} = req.params

    if (!channelId) {
        throw new ApiError(404, "channelId is  required");
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "channelId is not vaid");
    }

    const channelExists=await User.findById(channelId)

    if (!channelExists) {
        throw new ApiError(404, "channelId is not found");
    }

    const subscriptionExists=await Subscription.findOne({
        //$and is written in []
        $and:[{
            subscriber:req.user._id,
            channel:channelId
        }]
    })

    if (!subscriptionExists) {
        const subscriptionDetails=await Subscription.create({
            channel:new mongoose.Types.ObjectId(channelId),
            subscriber:new mongoose.Types.ObjectId(req.user._id)
        })

        if (!subscriptionDetails) {
            throw new ApiError(404, "subscription creation faied");
        }

        return res
            .status(201)
            .json(new ApiResponse(200, subscriptionDetails, "subscription created successfully"));
    }
    else{
        const deletedSubscription=await Subscription.findByIdAndDelete(subscriptionExists._id)

        if (!deletedSubscription) {
            throw new ApiError(404, "subscription deleted failed");
        }

        return res
        .status(201)
        .json(new ApiResponse(200,  "subscription deleted successfully"));
    }
        
})

// controller to return subscriber list of a channel
export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    //find that documents which in Subscription DB who have same channel and channelId
    // return that documents

    const {channelId} = req.params
    

    if (!channelId) {
        throw new ApiError(404, "channelId is  required");
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "channelId is not vaid");
    }

    const channelExists=await User.findById(channelId)

    if (!channelExists) {
        throw new ApiError(404, "channelId is not found");
    }

    const getSubscribersOfChannel=await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
              from: "users",
              localField: "subscriber",
              foreignField: "_id",
              as: "subscriberInfo",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              subscriberInfo: {
                $first: "$subscriberInfo",
              },
            },
          },
    ])
         
    
      if (getSubscribersOfChannel.totalDocs === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "ther is no subscriber"));
      }

    return res
    .status(201)
    .json(new ApiResponse(200, getSubscribersOfChannel, "subscribers of channel fetched successfully"));
})

// controller to return channel list to which user has subscribed
export const getSubscribedChannels = asyncHandler(async (req, res) => {
    //find that documents which in Subscription DB who have same subscriber and subscriberId
    // return that documents

    const {subscriberId} = req.params

    if (!subscriberId) {
        throw new ApiError(404, "subscriberId is  required");
    }

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(404, "subscriberId is not vaid");
    }

    const subscriberExists=await User.findById(subscriberId)

    if (!subscriberExists) {
        throw new ApiError(404, "subscriberId is not found");
    }

    const getSubscribersOfUser=await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
              from: "users",
              localField: "channel",
              foreignField: "_id",
              as: "channelInfo",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              channelInfo: {
                $first: "$channelInfo",
              },
            },
          },
    ])

    
      if (getSubscribersOfUser.totalDocs === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "user hasn't subscribed anybody"));
      }

    return res
    .status(201)
    .json(new ApiResponse(200, getSubscribersOfUser, "subscribers of user fetched successfully"));
})