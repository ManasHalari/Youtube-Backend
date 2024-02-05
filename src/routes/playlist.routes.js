import { Router } from 'express';
import {
    createPlaylist,
    updatePlaylist,  
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createPlaylist)

router
    .route("/:playlistId")
            .patch(updatePlaylist)

export default router