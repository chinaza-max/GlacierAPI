const mongoose=require('mongoose')
let userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:'this field is required',
        trim:true
    },
    password:{ 
        type:String,
        required:"this field is required",
        trim:true
    }, 
    email:{
        type:String,
        required:"this field is required",
        trim:true
    },
    tel:{
        type:Number,
        minimum:11
    },
    check:{
        type:Boolean,
        default:false
    },
    details:[],
    AccomodationImg:[],
    pdfs:[],
    notification:[] 
});

module.exports=mongoose.model("user",userSchema);

//details holds collection of book covers