import { Router } from 'express';
import {
    deleteVideo,
    getVideoById,
    publishAVideo,
    updateVideoFilesPart,
    updateVideoTextPart,   
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

    router
    .route("/:videoId")
    .get(getVideoById)
    .patch(updateVideoTextPart)

    router
    .route("/:videoId")
    .post( upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
        
    ]),updateVideoFilesPart)
    .delete(deleteVideo)
export default router