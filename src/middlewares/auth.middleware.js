import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/yt/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        //we can get cookies from req.cookies or from req.header which comes from mobile  syntax:Authorization: Bearer <token>
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        // console.log(token);
        
        
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log("decodedToken:",decodedToken);

        // this is id bcz we save that name in model not _id 
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
        // here we created new object name user from which we will get id of user anywhere
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }



})