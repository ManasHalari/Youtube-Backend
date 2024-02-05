import { isValidObjectId } from "mongoose"
import { Playlist } from "../models/yt/playlist .model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


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