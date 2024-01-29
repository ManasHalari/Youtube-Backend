import {isValidObjectId} from "mongoose"
import { Like } from "../models/yt/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"



export const toggleVideoLike = asyncHandler(async (req, res) => {
    //how to like a video
    //1.find that if video exists in Video DB
    //2.if it exists then check in Like DB that  this user has liked or not?
    //3.If it is liked then remoe it from DB
    //4.otherwise just create a new document
    const {videoId} = req.params
    
    if (!videoId) {
        throw new ApiError(400, "videoId is required")
                  }
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid object id");
                                   }

    //finding that user and video has already liked

    const likedVideo=await Like.find({
        $and:[
        {likedBy:req.user._id},
        {video:videoId}
        ]
    })

    //if there is already any video liked which is present in Like DB then remove that
    //here likedVideo exists mean there is some data which means video is liked which means else part will execute
    if (!likedVideo) {
        const deletedVideo=await Like.deleteOne({video:videoId})

        if (!deletedVideo) {
            throw new ApiError(400, "Video is not deleted")
        }

        return res.status(201).json(
            new ApiResponse(200, "Liked removed successfully Successfully")
        ) 
    } else {
        const createdLike=await Like.create({
            likedBy:req.user._id,
            video:videoId
        })

        if (!createdLike) {
            throw new ApiError(400, "Video liking work failed.")
        }

        return res.status(201).json(
            new ApiResponse(200,createdLike, "Video liking work successfull")
        )
    }
    
})

export const getLikedVideos = asyncHandler(async (req, res) => {

    // Steps to get all video
    
  let myAggregate = Like.aggregate();
  const resultedVideo = await Like.aggregatePaginate(
    myAggregate,
    {
        page:1,
        limit:10
    }
  );

  if (resultedVideo.totalDocs === 0) {
    return res.status(200).json(new ApiResponse(200, {}, "user has no video"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, resultedVideo, "video fetched successfully"));
    
})