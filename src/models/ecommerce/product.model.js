import mongoose from "mongoose"

const productSchema=new mongoose.Schema({
    tite:{
        type:String,
        required:true,
        unique:true,
        
    },
    price:{
        type:Number,
        required:true,
    },
    rating:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        default:0,
        minlength:[0,"it must be 8 characters"],
        maxlength:[100,"it must be 8 characters"],
    },
    description:{
        type:String,
        required:true,
        minlength:[20,"it must be 20 characters"],
        maxlength:[500,"it must be 500 characters"],
    },

    productImageUrl: {
        type: String,
      },
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    }
},{timestamps:true})
export const Product=mongoose.model("User",productSchema)