import { Router } from 'express';
import {
    createPlaylist,
    deletePlaylist,
    getUserPlaylists,
    updatePlaylist,  
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createPlaylist)

router
    .route("/:playlistId")
            .patch(updatePlaylist)
            .delete(deletePlaylist)

router.route("/user/:userId").get(getUserPlaylists);

export default router