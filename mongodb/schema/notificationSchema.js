const mongoose=require('mongoose')
const notificationSchema=new mongoose.Schema({
    notification:[]
})
module.exports=mongoose.model("notification",notificationSchema)
