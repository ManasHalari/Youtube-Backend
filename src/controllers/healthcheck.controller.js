import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


export const healthcheck = asyncHandler(async (req, res) => {
    return res.status(201).json(
        new ApiResponse(200, "OK")
    )  
})