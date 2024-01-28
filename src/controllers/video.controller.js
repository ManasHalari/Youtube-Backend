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
        cloudinay_public_idOfImage:thumbnailResponse?.public_id
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