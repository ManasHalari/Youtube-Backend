import mongoose from "mongoose"

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        unique:true,
        minlength:[8,"it must be 8 characters"],
        maxlength:[20,"passwrd mre than 20 characters are nt appicabe"]
    },
    avatar:{
        type:String,
        required:true,
        unique:true,
    }
},{timestamps:true})
export const User=mongoose.model("User",userSchema)