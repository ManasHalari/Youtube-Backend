import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/yt/user.model.js";
import { Video } from "../models/yt/video.model.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteImageOnCloudinary, deleteVideoOnCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"

function secondsToHms(d) {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);
    let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}

export const publishAVideo = asyncHandler(async (req, res) => {
    //take all details from user using form-data bcz of thumbnail and video
    //validate that all fileds are valid or not
    //upload thumbnail and video on cloudinary
    //save user's video data in DB

    const {title,description}=req.body;

    //check that none of the field have empty value
    if (
        [title, description].some((field) => field?.trim === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //take path from files
    const videoLocalPath=req.files?.videoFile[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;

    if (!videoLocalPath ) {
        throw new ApiError(400,"video is required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400,"thumbnail is required")
    }

    //upload file on cloudinary
    const videoResponse=await uploadOnCloudinary(videoLocalPath)
    const thumbnailResponse=await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoResponse && !thumbnailResponse) {
        throw new ApiError(500,"files are not uploaded")
    }

    // console.log(videoResponse,"\n",thumbnailResponse);

    let time=secondsToHms(videoResponse?.duration);
    const video=await Video.create({
        title,
        description,
        videoFile: videoResponse?.secure_url,
        //here write that name which is as saved in DB not thumbnailUrl
        thumbnail: thumbnailResponse?.secure_url,
        isPublished:true,
        duration:time,
        cloudinay_public_idOfVideo:videoResponse?.public_id,
        cloudinay_public_idOfImage:thumbnailResponse?.public_id,
        owner: req.user._id,
    })

    if (!video) {
        throw new ApiError(400,"video details is not saved in DB")
    }

    const videoDetails=await Video.findById(video._id)

    if (!videoDetails) {
        throw new ApiError(400,"video details cannot found in  DB")
    }

    return res.status(201).json(
        new ApiResponse(200,videoDetails, "video published Successfully")
    )   

   
    

})

export const getAllVideos = asyncHandler(async (req, res) => {
    // Steps to get all video
  // take all required information from req.query
  // Now, validate all fields to check they are not empty
  /* sortBy -> tells by which field to sort (eg. title, description, etc)
   * sortType -> tells two options ascending(asc) or descending(desc)
   */
  // Now, use mongodb aggregation pipeline
  // 1. $match using $and operator both the query and userId
  // 2. sort order taken from the req.query
  // 3. use mongodb aggregate paginate

  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (!query || !sortBy || !sortType) {
    throw new ApiError(404, "All fields are required");
  }

  const userExists = await User.findById(userId);

  if (!userExists) {
    throw new ApiError(404, "user not found");
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  // create sortOptions
  let sortOptions = {};

  /* Here, if sortBy exists  then it set sortOptions property to sortBy using [] bracket notation
   *  and its value is set using ternary operation that says if sortType === desc then
   *  set sortOptions[sortBy] to -1 else 1
   *
   * You can also write the below condition like this
   *
   *    let sortOptions = {
   *        [sortBy]: sortType === 'desc' ? -1 : 1
   *    }
   */
  if (sortBy) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  }

  const videoAggregationPipeline = Video.aggregate([
    {
      $match: {
        $and: [
          {
            owner: new mongoose.Types.ObjectId(userId),
          },
          {
            title: {
              //matches pattern on the basis of this query that this query matvhes with title or not
              $regex: query,
              $options: "i",
            },
          },
        ],
      },
    },
    {
      $sort: sortOptions,
    },
  ]);

  const resultedVideo = await Video.aggregatePaginate(
    videoAggregationPipeline,
    options
  );

  if (resultedVideo.totalDocs === 0) {
    return res.status(200).json(new ApiResponse(200, {}, "user has no video"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, resultedVideo, "video fetched successfully"));
})

export const getVideoById = asyncHandler(async (req, res) => {
    //take video id from user
    //check into DB if it exists then return video details

    //here the name is videoId whatever we fetvh from paramas bcz we name that thing as videoId in route
    const {videoId}=req.params;
   
   if (!videoId) {
    throw new ApiError(400, "videoId is required")
   } 

   //check if it is present in DB

   const videoDetails=await Video.findById(videoId)

   if (!videoDetails) {
    throw new ApiError(400, "video doesn't exist")
   } 

    return res.status(201).json(
        new ApiResponse(200,videoDetails,  "video fetched Successfully")
    )   
})

export const updateVideoTextPart = asyncHandler(async (req, res) => {
    //take video id from user
    //check in DB that video is available or not
    //if video is available then update title and description
    //if thubnail and video is present than do other things

   const {videoId}=req.params;
   
   if (!videoId) {
    throw new ApiError(400, "videoId is required")
   } 

   //take decription and title from body
   const {title,description}=req.body;

   //check if it is present in DB

   const videoDetails=await Video.findByIdAndUpdate(
    videoId,
    {
        title,
        description
    },
    {
        new:true
    }
    
    )

   if (!videoDetails) {
    throw new ApiError(400, "video doesn't exist")
   } 

   return res.status(201).json(
    new ApiResponse(200,videoDetails, "video updated Successfully")
)  

   
})

export const updateVideoFilesPart = asyncHandler(async (req, res) => {
    //take video id from user
    //check in DB that video is available or not
    //if video is available then update title and description
    //if thubnail and video is present than do other things

   const {videoId}=req.params;
   
   if (!videoId) {
    throw new ApiError(400, "videoId is required")
   } 

   //take path from files
   const newVideoLocalPath=req.files?.videoFile[0]?.path;
   const newThumbnailLocalPath=req.files?.thumbnail[0]?.path;

   //check if file is available or not
   if (!newThumbnailLocalPath || !newVideoLocalPath) {
    throw new ApiError(400,"files are required")
   }

   console.log(newThumbnailLocalPath,newVideoLocalPath);

   //upload file on cloudinary
   const videoResponse=await uploadOnCloudinary(newVideoLocalPath)
   const thumbnailResponse=await uploadOnCloudinary(newThumbnailLocalPath)

   console.log(videoResponse,thumbnailResponse);
   if (!videoResponse || !thumbnailResponse) {
       throw new ApiError(500,"files are not uploaded")
   }

   // now delete that asset which is present in cloudinary
   //here we need to put public_id of that asset which is presnt on cloudinary for that we have stored public_id of that asset in our DB
   //for that first make one DB call
   let videoInDB= await Video.findById(videoId);
   await deleteVideoOnCloudinary(videoInDB.cloudinay_public_idOfVideo);
                             
   await deleteImageOnCloudinary(videoInDB.cloudinay_public_idOfImage);

   //check if it is present in DB

   let time=secondsToHms(videoResponse?.duration);

   const newVideoDetails=await Video.findByIdAndUpdate(
    videoId,
    {
        thumbnail:thumbnailResponse.secure_url,
        videoFile:videoResponse.secure_url ,
        duration:time,
        cloudinay_public_idOfImage:thumbnailResponse.public_id,
        cloudinay_public_idOfVideo:videoResponse.public_id
    },
    {
        new:true
    }
    
    )

   return res.status(201).json(
    new ApiResponse(200,newVideoDetails, "video files  updated Successfully")
)  

   
})

export const deleteVideo = asyncHandler(async (req, res) => {
    //take videoId from user through params
    //delete video and file from cloudinary for that we have public_id in DB
    //delete that video from DB

    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "videoId is required")
       } 


   //delete that assets which are present on cloudinary
   const videoInDB=await Video.findById(videoId)

   if (!videoInDB) {
    throw new ApiError(400, "video is not required")
   } 
   await deleteVideoOnCloudinary(videoInDB.cloudinay_public_idOfVideo);
                             
   await deleteImageOnCloudinary(videoInDB.cloudinay_public_idOfImage);
    
   //delete that video
   await Video.findByIdAndDelete(videoId)
    return res.status(201).json(
        new ApiResponse(200, "video removed Successfully")
    )  

})

export const togglePublishStatus = asyncHandler(async (req, res) => {
    //take videoId from user
    //find that video in DB and toogle or say reverse which is value of published
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "videoId is required")
       } 

       //find that video in DB
    const newVideoDetails=await Video.findById(videoId)

    if (newVideoDetails.isPublished) {
        newVideoDetails.isPublished=false
        await newVideoDetails.save()
    }
    else{
    newVideoDetails.isPublished=true;
    await newVideoDetails.save();
    }

    if (!newVideoDetails) {
        throw new ApiError(400, "video is not found")
    }

    return res.status(201).json(
        new ApiResponse(200,newVideoDetails, "video toggle Successfully")
    )  
})