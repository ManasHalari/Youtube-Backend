import { Router } from 'express';
import {
    addComment,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId")
        .post(addComment);

router.route("/c/:commentId")
          .patch(updateComment);

export default router