import mongoose  from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectedDB= async ()=>{
        try {
            const connect=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            console.log(`MongoDb Connected Successfully ${connect.connection.host}`)
        } catch (error) {
            console.error("DB FAIED",error);
            process.exit(1)
        }

}