import {Router} from "express"
import { loginUser, logoutUser, registerUser,refreshAccessToken, changeCurrentPassword,getUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/register.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const userRouter=Router()

userRouter.route("/register")
    .post(
        upload.fields([
            {
                name: "avatar",
                maxCount: 1
            }, 
            {
                name: "coverImage",
                maxCount: 1
            }
        ]),
    registerUser
    )

    userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").post(verifyJWT,  logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/changepassword").post(verifyJWT,changeCurrentPassword)
userRouter.route("/getuser").post(verifyJWT,getUser)
userRouter.route("/updatedetails").patch(verifyJWT,updateAccountDetails)
userRouter.route("/updatedavatar").patch(
        upload.single('avatar')
        ,verifyJWT,
        updateUserAvatar
        )
userRouter.route("/updatedcoverimage").patch(
    upload.single('coverImage')
    ,verifyJWT,
    updateUserCoverImage
    )
 userRouter.route("/getuserchannelprofile/:username").post(
        getUserChannelProfile
        )
userRouter.route("/history").get(verifyJWT, getWatchHistory)
    


export default userRouter;