import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors())
// routes import

import healthcheckRouter from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import LikeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js"
import tweetRouter from "./routes/tweet.routes.js"

//decare rutes
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users",userRouter)
// http://localhost:8000/api/v1/users/register

app.use("/api/v1/videos",videoRouter )
app.use("/api/v1/likes",LikeRouter )
app.use("/api/v1/comments",commentRouter )
app.use("/api/v1/tweets",tweetRouter )


export default app;