import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likesSchema=new mongoose.Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },


},{timestamps:true})

//we can't give a all videos which are liked to the user so we will give limited no. of videos
likesSchema.plugin(mongooseAggregatePaginate)

export const Like=mongoose.model("Like",likesSchema)