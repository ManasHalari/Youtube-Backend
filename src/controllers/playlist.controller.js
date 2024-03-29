import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/yt/playlist .model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/yt/user.model.js"
import {Video} from "../models/yt/video.model.js"


export const createPlaylist = asyncHandler(async (req, res) => {
    //check that we got name and decription or not
    //if we get then create one playlist

    const {name, description} = req.body

    if (
        [name, description].some((field) => field?.trim === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const createdPlaylist=await  Playlist.create({
        name,
        description,
        owner:req.user._id
    })

    if (!createdPlaylist) {
        throw new ApiError(400, "Playlist is not created")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, createdPlaylist, "Playlist created successfully"));

    
})

export const getUserPlaylists = asyncHandler(async (req, res) => {
    //first we need to check that user exists or not
    //if exists then we need to send all  the data of this user's playlist
    //else we will give an error

    const {userId} = req.params
    const {page=1,limit=10}=req.query

    if (!userId) {
        throw new ApiError(404, "userId is  required");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "userId is not vaid");
    }

    const userExists=await User.findById(userId)

    if (!userExists) {
        throw new ApiError(404, "User is not found");
    }

    const playlistAggregate=await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort:{
                //that means which Playlist comes first will be view first
                createdAt:-1
            }
        }
    ])

    const options={
        page:parseInt(page),
        limit:parseInt(limit)
    }

    const getUserPlaylistsDocs=await Playlist.aggregatePaginate(
        playlistAggregate[0],
        options
    )

    if (getUserPlaylistsDocs.totalDocs === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "user has no Playlists"));
      }

    return res
    .status(201)
    .json(new ApiResponse(200, getUserPlaylistsDocs, "Playlists fetched successfully"));
    
})

export const getPlaylistById = asyncHandler(async (req, res) => {
    //verify that we got playlistId or not
    //check in Playlist DB that playlistId is there or not
    //if there is then give response

    const {playlistId} = req.params

    if (!playlistId) {
        throw new ApiError(404, "playlistId is  required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "playlistId is not vaid");
    }

    const playlistExists=await Playlist.findById(playlistId)

    if (!playlistExists) {
        throw new ApiError(404, "playlist is not found");
    }

    return res
    .status(201)
    .json(new ApiResponse(200, playlistExists, "Playlists fetched successfully"));
    
})

export const updatePlaylist = asyncHandler(async (req, res) => {
    //verify that we get all fields or not
    //find that playlist in Playlist DB in Update it

    const {playlistId} = req.params
    const {name, description} = req.body
    
    if (!playlistId) {
        throw new ApiError(404, "playlistId is  required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "playlistId is not vaid");
    }

    if (name.trim()==="" && description.trim()==="") {
        throw new ApiError(404, "name and description both are empty");
    }

    const playlistExists=await Playlist.findById(playlistId)

    if (!playlistExists) {
        throw new ApiError(404, "Playlist is not found");
    }

    const updatedplaylist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description
        },
        {
            new:true
        }
    )

    if (!updatedplaylist) {
        throw new ApiError(404, "playlistId updation failed");
    }

    return res
    .status(201)
    .json(new ApiResponse(200, updatedplaylist, "Playlist updated successfully"));
})

export const deletePlaylist = asyncHandler(async (req, res) => {
    //verify that we get playlistId or not if we get then just delete it

    const {playlistId} = req.params
    
    if (!playlistId) {
        throw new ApiError(404, "playlistId is  required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "playlistId is not vaid");
    }

    const playlistExists=await Playlist.findById(playlistId)

    if (!playlistExists) {
        throw new ApiError(404, "Playlist is not found");
    }

    const deletedPlaylist=await Playlist.deleteOne({
        _id:playlistId
    })

    if (!deletedPlaylist) {
        throw new ApiError(404, "playlistId is not deleted");
    }

    return res
    .status(201)
    .json(new ApiResponse(200,  "Playlist deleted successfully"));
})

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
    //verify that we got all field or not
    //find that  video and playlist exist or not
    //add the video to the playlist

    const {playlistId, videoId} = req.params

    if (!playlistId) {
        throw new ApiError(404, "playlistId is  required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "playlistId is not vaid");
    }

    if (!videoId) {
        throw new ApiError(404, "playlistId is  required");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "playlistId is not vaid");
    }

    const videoExists=await Video.findById(videoId)

    if (!videoExists) {
        throw new ApiError(404, "video do not exists");
    }

    const playlistExists=await Playlist.findById(playlistId)

    if (!playlistExists) {
        throw new ApiError(404, "Playlist do not exists");
    }

    await  playlistExists.videos.push(videoId);

    const newPlayList=await playlistExists.save();

    return res
    .status(201)
    .json(new ApiResponse(200, newPlayList, "in Playlist Video added successfully"));
    
})

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    //verify that we got all field or not
    //here don't need to check that video exists or not because if it exists then we remove or not found message will given
    //find that playlist exist or not
    //check that video exists in playlist or not
    //it it exists then delete that video

    const {playlistId, videoId} = req.params
    
    if (!playlistId) {
        throw new ApiError(404, "playlistId is  required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "playlistId is not vaid");
    }

    if (!videoId) {
        throw new ApiError(404, "playlistId is  required");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "playlistId is not vaid");
    }

    const playlistExists=await Playlist.findById(playlistId)

    if (!playlistExists) {
        throw new ApiError(404, "Playlist do not exists");
    }

    const videoExistsinArray=await playlistExists.videos.find((video) => video==videoId)

    console.log(videoExistsinArray);

    if (!videoExistsinArray) {
        throw new ApiError(404, "video do not exists in Array");
    }

    const videoDeleted=await playlistExists.videos.filter(function(video) {
        //here need to give that array
        return video !== videoExistsinArray
    })
    
    console.log(videoDeleted);

    if (!videoDeleted) {
        throw new ApiError(404, "video deletion failed");
    }

    playlistExists.videos=videoDeleted;

    const newPlayList=await playlistExists.save();

    if (!newPlayList) {
        throw new ApiError(404, "Can't fetch videos");
    }

    return res
    .status(201)
    .json(new ApiResponse(200, newPlayList, "in Playlist Video deleted successfully"));
})