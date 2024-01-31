import mongoose,{isValidObjectId} from "mongoose"
import { Like } from "../models/yt/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/yt/video.model.js"

//First we need to understand what Like DB stores? it stores that document if user has Liked any video,comment or tweet

export const toggleVideoLike = asyncHandler(async (req, res) => {
    //how to like a video
    //1.find that if video exists in Video DB
    //2.if it exists then check in Like DB that  this user has liked or not?
    //3.If it is liked then remove it from DB
    //4.otherwise just create a new document
    const {videoId} = req.params
    
    if (!videoId) {
        throw new ApiError(400, "videoId is required")
                  }
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid object id");
                                   }
                            
    //check if video exists or not                              
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
      }    

    //finding that user and video has already liked

    const likedVideo=await Like.findOne({
        $and:[
        {likedBy:req.user._id},
        {video:videoId}
        ]
    })

    //if there is already any video liked which is present in Like DB then remove that
    
    if (likedVideo) {
        //here likeVideo not Like which is DB
        const deletedVideo=await likedVideo.deleteOne();

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

export const toggleCommentLike = asyncHandler(async (req, res) => {
    //how to like a comment
    //1.find that if comment exists in Comment DB
    //2.if it exists then check in Like DB that  this user has liked or not?
    //3.If it is liked then remoe it from DB
    //4.otherwise just create a new document
    const {commentId} = req.params
    
    if (!commentId) {
        throw new ApiError(400, "commentId is required")
                  }
    
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid object id");
                                   }
    
    //check if comment exists or not  in comment DB                            
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found");
      }   

    //find that commentId in Like DB 
    const likedCommentExists=await Like.findOne({
        $and:[
        {likedBy:req.user._id},
        {comment:commentId}
        ]
    })
        // console.log(likedCommentExists)
    //if  the comment already exists in DB then  remove it from DB
    if (likedCommentExists) {
        //here likedCommentExists not Like which is DB
        const deletedComment=await likedCommentExists.deleteOne();

        if (!deletedComment) {
            throw new ApiError(400, "Comment is not deleted")
        }

        return res.status(201).json(
            new ApiResponse(200, "Comment removed successfully Successfully")
        )
                
    }
    else{
        //if comment do not exist in DB then we need to create new document which  will be likes on comment
        const likedComment=await Like.create({
            likedBy : req.user._id ,
            comment:commentId
        })

        if (!likedComment) {
            throw new ApiError(400, "Comment liking work failed.")
        }

        return res.status(201).json(
            new ApiResponse(200,likedComment, "Comment liking work successfull")
        )
    }
})

export const toggleTweetLike  = asyncHandler(async (req, res) => {
    //how to like a comment
    //1.find that if comment exists in tweet DB
    //2.if it exists then check in Like DB that  this user has liked or not?
    //3.If it is liked then remoe it from DB
    //4.otherwise just create a new document
    const {tweetId} = req.params
    
    if (!tweetId) {
        throw new ApiError(400, "tweetId is required")
                  }
    
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid object id");
                                   }
    
    //check if video exists or not                              
    const tweet = await Video.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "tweet not found");
      }   

    //find that commentId in Like DB 
    const likedTweetExists=await Like.findOne({
        $and:[
        {likedBy:req.user._id},
        {tweet:tweetId}
        ]
    })
       
    //if  the Tweet already exists in DB then  remove it from DB
    if (likedTweetExists) {
        //here likedCommentExists not Like which is DB
        const deletedTweet=await likedTweetExists.deleteOne();

        if (!deletedTweet) {
            throw new ApiError(400, "Tweet is not deleted")
        }

        return res.status(201).json(
            new ApiResponse(200, "Tweet removed successfully Successfully")
        )
                
    }
    else{
        //if Tweet do not exist in DB then we need to create new document which  will be likes on Tweet
        const likedTweet=await Like.create({
            likedBy : req.user._id ,
            tweet:tweetId
        })

        if (!likedTweet) {
            throw new ApiError(400, "Tweet liking work failed.")
        }

        return res.status(201).json(
            new ApiResponse(200,likedTweet, "Tweet liking work successfull")
        )
    }
})