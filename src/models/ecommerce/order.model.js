import mongoose from "mongoose"
const orderItems=new mongoose.Schema({
    product: {type : mongoose.Schema.Types.ObjectId, ref:"Product"},
    quantity:{ type: Number , required: true},

})
const orderSchema=new mongoose.Schema({
    items:[{
        product: {type : mongoose.Schema.Types.ObjectId, ref:"Product"},
        quantity:{ type: Number , required: true},
    }]
    //items:[orderItems]

})
export const order=mongoose.model("Product",orderSchema)