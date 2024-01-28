import {v2 as cloudinary} from 'cloudinary';
import * as fs from 'fs';

cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME , 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

export const uploadOnCloudinary =async function(localFilePath){
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        // console.log("cloudinary image:",response)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export const deleteImageOnCloudinary=async function(cloudinary_public_id){
    try {
        if (!cloudinary_public_id) {
            return null;
        }
       const res=await cloudinary.uploader.destroy(
        cloudinary_public_id,
        {
            resource_type:"image"    
        },(result,err)=>{
            // console.log("result",result);
            return result;
        })
        // console.log("res",res);
        return res;
    } catch (error) {
        console.log("image is not deleted from cloudinary",error);
    }
}

export const deleteVideoOnCloudinary=async function(cloudinary_public_id){
    try {
        if (!cloudinary_public_id) {
            return null;
        }
        //here type of public id is string
       const res=await cloudinary.uploader.destroy(
        cloudinary_public_id,
        {
            resource_type:"video"    
        },(result,err)=>{
            // console.log("result",result);
            return result;
        })
        // console.log("res",res);
        return res;
    } catch (error) {
        console.log("video is not deleted from cloudinary",error);
    }
}