// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import app from "./app.js"
import { connectedDB } from './db/db.js'


dotenv.config({
    path: './.env'
})

connectedDB()
.then(() => {
    //if app is nt wrking
    app.on("error",(err) => {
        console.log("App is failed ", err);
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})