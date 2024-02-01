import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/yt/comment.model.js";
import { Video } from "../models/yt/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getVideoComments = asyncHandler(async (req, res) => {
    //validate that all fiels are available or not
    //check if the video exists in database
    //if video exists then we need to look in Comment in DB that how many times that videoId is present in DB that many times is comments and we will get that videos only which have that videoId
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId) {
        throw new ApiError(400,"videoId is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"videoId is not valid")
    }

    //check in Video DB that videoId exists or not
    const videoComments=await Comment.aggregate([
        {
            $match:{
                //here don't write directly videoId beacuse aggregate don't generate ObjectId so we need to create that
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort:{
                //that means which comment comes first will be view first
                createdAt:-1
            }
        }
    ])

    if (!videoComments) {
        throw new ApiError(404, "videoComments does not exists")
    }

    const resultedComments=await Comment.aggregatePaginate(
        videoComments[0],
        {
            page,
            limit
        }
    )
    
    if (!resultedComments) {
        throw new ApiError(404, "resultedComments does not exists")
    }

    if (resultedComments.totalDocs === 0) {
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "video has no comments"));
      }

    return res
    .status(200)
    .json(
        new ApiResponse(200, resultedComments, "Video Comment fetched successfully")
    )
})

export const addComment = asyncHandler(async (req, res) => {
    //we get videoId from req.params and content from req.body
    //vaidate that we get both fieds or not
    //find that any video exist in Video DB or not
    //create a new comment

    const {videoId}=req.params;
    const {comment}=req.body;

    if (!videoId) {
        throw new ApiError(400,"videoId is required")
    }

    if (!comment) {
        throw new ApiError(400,"comment is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"videoId is not valid")
    }
    //check in Video DB that videoId exists or not
    const video=await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400,"video not exist")
    }

    const commentDetails=await Comment.create({
        content:comment,
        video:videoId,
        owner:req.user._id
    })

    if (!commentDetails) {
        throw new ApiError(500,"comment can't create")
    }

    return res.status(201).json(
        new ApiResponse(200,commentDetails,"Comment created Successfully")
    )
})

export const updateComment = asyncHandler(async (req, res) => {
    //we get commentId from req.params and content from req.body
    //vaidate that we get both fieds or not
    //find that any comment exist in Comment DB or not
    //update a new comment

    const {commentId}=req.params;
    const {new_comment}=req.body;

    if (!commentId) {
        throw new ApiError(400,"commentId is required")
    }

    if (!new_comment) {
        throw new ApiError(400,"comment is required")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400,"commentId is not valid")
    }
    //check in Comment DB that commentId exists or not
    const updatedCommentDetails=await Comment.findByIdAndUpdate(
            commentId,
            {
                $set:{content:new_comment}
            },
            {
                new:true
            }
            )

    if (!updatedCommentDetails) {
        throw new ApiError(400,"comment not exist")
    }

    return res.status(201).json(
        new ApiResponse(200,updatedCommentDetails,"Comment created Successfully")
    )


})

export const deleteComment = asyncHandler(async (req, res) => {
    //we get commentId from req.params 
    //vaidate that we get  fied or not
    //find that any comment exist in Comment DB or not
    //delete a new comment

    const {commentId}=req.params;

    if (!commentId) {
        throw new ApiError(400,"commentId is required")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400,"commentId is not valid")
    }
    //check in Comment DB that commentId exists or not
    const deleteCommentDetails=await Comment.findByIdAndDelete(
            commentId,
            {
                new:true
            }
            )

    if (!deleteCommentDetails) {
        throw new ApiError(400,"comment not delete")
    }

    return res.status(201).json(
        new ApiResponse(200,"Comment deleteed Successfully")
    )


})