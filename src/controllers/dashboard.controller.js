import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/yt/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/yt/subscription.model.js";

export const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    //for getting total subscribers find how much channel there is in Subscriber DB then count that

    const channelId=req.user._id; 
    
    const channelSubscribersInfo=await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
              _id: "$channel",
              totalSubscribers: {
                $sum: 1,
              },
            },
          },
    ])

    const totalVideoAndViews=await Video.aggregate([
            {
                $match:{
                    owner:new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $group: {
                  _id: "$owner",
                  totalVideos: {
                    $sum: 1,
                  },
                  totalViews: {
                    //here we need to put that field views with $ sign
                    $sum: "$views",
                  },
                },
            },
      ])

      if (totalVideoAndViews.totalDocs === 0 && channelSubscribersInfo.totalDocs==0) {
        return res.status(200).json(new ApiResponse(200, {}, "channel has no cintent"));
      }

      const channelStats = {
        totalVideoAndViews,
        channelSubscribersInfo,
      }; 

    return res
    .status(201)
    .json(new ApiResponse(200, 
        channelStats, "channelStats fetched successfully"));

    
})

export const getChannelVideos = asyncHandler(async (req, res) => {
    //we will get channelId from req.user._id because we are fetching videos of channel who is also user
    //find in Subscription DB that any channel of this id exist or not
    //if exists then fetch all videos from Video DB

    const channelId=req.user._id

    if (!channelId) {
        throw new ApiError(404,"channelId is required")
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(404,"channelId is not valid")
    }

    const allVideoOfChannels=await Video.aggregate([
        {
            $match: {
                owner:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField: 'owner',
                foreignField:'_id',
                as:"allVideos",
                pipeline:[
                    {
                        $project: {
                          username: 1,
                          avatar: 1,
                        },
                      },
                ]
            }
        }
    ])

    if (allVideoOfChannels.totalDocs === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "channel have no videos uploaded"));
      }

    return res
    .status(201)
    .json(new ApiResponse(200, allVideoOfChannels, "all videos of channel fetched successfully"));
})