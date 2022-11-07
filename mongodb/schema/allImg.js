const mongoose=require('mongoose')


let imageSchema= new mongoose.Schema({
    bookDetails:[],
    AccomodationImg:[],
})
module.exports=mongoose.model("book",imageSchema);

