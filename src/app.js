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

import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"

//decare rutes

app.use("/api/v1/users",userRouter)
// http://localhost:8000/api/v1/users/register
app.use("/api/v1/videos",videoRouter )
export default app;