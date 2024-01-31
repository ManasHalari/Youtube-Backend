import { isValidObjectId } from "mongoose";
import { Comment } from "../models/yt/comment.model.js";
import { Video } from "../models/yt/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


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
    //check in Video DB that videoId exists or not
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