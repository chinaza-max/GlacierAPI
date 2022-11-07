const express = require('express');
const User=require("../mongodb/schema/userSchema")
const Notification=require("../mongodb/schema/notificationSchema")
const allImg=require("../mongodb/schema/allImg")
const router=express.Router();
const fs=require('fs');
const {nameOfFiles,deleteAllFiles,deleteAllPDFFiles,deleteAllAccomodationFiles}=require("../deletefiles");
const mongoConnection=require('mongoose')
const connection=mongoConnection.connection;
const {google} = require('googleapis');




router.get('/deleteAllAcc/:AdminId/:id',(req,res)=>{
   // deleteAllFiles()

   deleteAllPostFromNotificattion()
   let id=req.params.id
   let array=[]
   let array2=[]
    
    User.findById(id,async(err,user)=>{
        if(err){
            return console.log(err)
        }
        else{
            if(user){
                for(let k=0; k<user.pdfs.length; k++){
                    array2.push(user.pdfs[k].driveID)
                    if(k==user.pdfs.length-1){
                        for(let l=0; l<array2.length; l++){
                            deleteDriveFile_2(array2[l])
                        }
                    }
                }
            }
        }
    })
    allImg.find((err,data)=>{
        if(err){
            console.log(err)
        }
        else{
            if(data){
                    for(let i=0; i < data[0].bookDetails.length; i++){
                        if(data[0].bookDetails[i].driveID){
                            array.push(data[0].bookDetails[i].driveID)
                        }
                    }
                    for(let j=0; j < data[0].AccomodationImg.length; j++){
                        if(data[0].AccomodationImg[j].driveID){
                            array.push(data[0].AccomodationImg[j].driveID)
                        }
                    }
                    for(let m=0;m<array.length;m++){
                        deleteDriveFile(array[m])
                    }
            }   
        }
    })

    if(req.params.AdminId===process.env.AdminId){
        connection.db.listCollections().toArray((err,names)=>{
            if(err){
                console.log("check route deleteAllAcc")
                console.log(err)
            }
            else{
                    
                for(i=0;i<names.length; i++){
                        mongoConnection.connection.db.dropCollection(names[i].name, function (err, result) {
                                if (err) {
                                    console.log(err)
                                }
                    })
                
                    if(i==names.length-1){
                        console.log("names")
                        res.send({express:"all account has been deleted"})
                    }
                }
            }
        })
    }
})

router.get("/deleteSingleAcc/:name",(req,res)=>{
    let listofPostTodelete=[];
    let array=[]
    User.find({"details.name":req.params.name},async(err,data)=>{
        
        if(err){
            console.log("err")
            console.log(err)
        }
        else if(data.length!==0){
            let id=data[0]._id
            let name=data[0].name
            let tel=data[0].tel
            data[0].details.forEach((data)=>{
                listofPostTodelete.push(data.name)
                array.push(data.driveID)
            })
            for(let i=0; i<listofPostTodelete.length; i++){
                deleteDriveFile(array[i])
                deletePostFromBookCollection(listofPostTodelete[i])
            }
            //this function send file name to be deleted from the directory
          // await  nameOfFiles(listofPostTodelete);
            
            if(id){
                User.findOneAndRemove({_id:id},(err)=>{
                    if(err){
                        console.log(err)
                      return  res.status(500).send('no')
                    }
                    return res.status(200).send({"name":name,"tel":tel})
                })
            }
        }
        else{
            return res.status(200).send({"name":"No user found"})
        }
    })
})

router.get("/deleteAllPDF/:id",(req,res)=>{
    

    let id=req.params.id
    let array=[]
    User.findById(id,async(err,user)=>{
        if(err){
            return console.log(err)
        }
        else{
           if(user.pdfs.length!=0){
                for(let i=0; i<user.pdfs.length; i++ ){
                    array.push(user.pdfs[i].driveID )
                    if(i==user.pdfs.length-1){
                        for(let j=0; j<array.length; j++){
                            deleteDriveFile_2(array[j])
                            console.log(array[j])
                            if(j==array.length-1){
                                deletePDFmongo()
                            }
                        }
                    }
                }
           }
           else{
            res.send({express:"No PDF To remove"})
           }
        }
    })
    deleteAllPostFromNotificattion()
    function deletePDFmongo(){
        User.updateMany({_id:req.params.id},{ $set: { pdfs: [] }},function(err, affected){
            if(err){
                console.log(err)
            }
            else{
                res.send({express:"All PDF removed"})
            }
        })
    }
 
})

router.get('/DropSinglePDF/:name/:id',(req,res)=>{
    let id=req.params.id
    let imgName=req.params.name
   
    User.findById(id,async(err,user)=>{
       if(err){
           console.log("check post route /deletePost/:id/:name")
           console.log(err)
       }
       else{
            if(user){
                
                let obj=user.pdfs.find((va)=>{    
                    if(va.name==imgName){
                        deleteDriveFile_2(va.driveID)
                    }
                    return  va.name==imgName
                })
              
                if(obj){
                    try{
                        await User.findOneAndUpdate({_id:req.params.id},
                        {$pull:{pdfs:obj}})

                        res.send({express:"succefully Deleted"})
                    }
                    catch(err){
                        console.log("err"+  err)
                    }
                }
                else{
                    res.send({express:"not found in db"})
                }
            }
       }
    })
})

router.get("/deleteAllBook",(req,res)=>{

     deleteAllPostFromBook();
     deleteAllPostFromNotificattion()
    //this function below helps to delete all file in the directory;
   
    User.find((err,data)=>{
       if(err){
            console.log(err)
       }
       else{
        for(let i=0; i<data.length;i++){
            
            User.updateMany({_id:data[i]._id},{ $set: { details: [] }},function(err, affected){
                if(err){
                    console.log(err)
                    return 
                }
            })
        }
        res.send({express:"All Book removed"})
       }
    })
})
//Delete single accomodation upload
router.get("/deleteSingleAccomodation/:name",(req,res)=>{
    let imgName=req.params.name
    deletePostFromAccomodationCollection(imgName)
    User.find({"AccomodationImg.unique":req.params.name},async (err,user)=>{
        if(err){
            console.log(err)
        }
        else if(user.length!==0){
            let obj=await user[0].AccomodationImg.find((va)=>{    
                return  va.unique==imgName
            })
          
            if(obj){
                await User.findOneAndUpdate({_id:user[0]._id},
                    {$pull:{AccomodationImg:obj}})
                
                try{
                    if(obj.name=="/accomodationImg/firstImg.jpg"){
                          res.send({express:"succefully Deleted"})
                    }
                   
                }
                catch(err){
                    console.log("err"+  err)
                }
            
            }

        }
        else{
            res.status(200).send({"express":"does not exit"})
        }
    
    })
})
//Delete single book cover
router.get("/deleteSinglePost/:name",(req,res)=>{
    let imgName=req.params.name
    deletePostFromBookCollection(imgName)
    User.find({"details.name":req.params.name},async (err,user)=>{
        if(err){
            console.log("err")
            console.log(err)
        }
        else if(user.length!==0){
            let obj=await user[0].details.find((va)=>{    
                return  va.name==imgName
            })
          
            if(obj){
                await User.findOneAndUpdate({_id:user[0]._id},
                    {$pull:{details:obj}})
                
                try{
                    fs.unlinkSync("./client/public/uploads/"+imgName)
                    res.send({express:"succefully Deleted"})
                }
                catch(err){
                    console.log("err"+  err)
                }
            
            }

        }
        else{
             res.status(200).send({"express":"does not exit"})
        }
    
    })
})
router.get("/deleteAllAccomodationPost",(req,res)=>{
    deleteAllAccomodationPost();
    //deleteAllAccomodationFiles();
    User.find((err,data)=>{
        if(err){
             console.log(err)
        }
        else{
         for(let i=0; i<data.length;i++){
             
             User.updateMany({_id:data[i]._id},{ $set: { AccomodationImg: [] }},function(err, affected){
                 if(err){
                     console.log(err)
                     return 
                 }
             })
         }
         res.send({express:"All AccomodationPost removed"})
        }
     })
})

router.get("/generateAccDetails/:name",(req,res)=>{
    User.find({"details.name":req.params.name},(err,user)=>{
        if(err){
            console.log(err)
        }
        else if(user.length!==0){
            res.send({express:user[0].name,express2:user[0].tel})
        }
        else{
            res.send({express:"no user found"})
        }
    })
})

router.get("/checkValue/:id",(req,res)=>{
    User.find({tel:req.params.id},(err,user)=>{
        if(err){
            console.log(err)
        }
        else if(user.length!==0){
            res.send({express:user[0].check,express2:process.env.Pay_Stack_APIKEY})
        }
        else{
            res.send({express:"no user found"})
        }
    })
}) 

router.post("/updateTel/:id",(req,res)=>{
   
    User.findOneAndUpdate({_id:req.params.id},{tel:req.body.tel},(err,data)=>{
        if(err){
            res.json({express:"problem from server updating phone number"}).status(500)
            console.log(err)
           return 
        }
        else{
            res.json({express:"successfully updated"}).status(300)
        }
    })
})

router.post("/updateCheckValue/:id/:value",(req,res)=>{

    User.findOneAndUpdate({tel:req.params.id},{check:req.params.value},(err,data)=>{
        if(err){
            res.json({express:"problem from server updating phone number"}).status(500)
            console.log(err)
           return 
        }
        else{
           // console.log(data)
            res.json({express:"successfully updated"}).status(300)
        }
    })
})

function deleteAllPostFromBook(){
    allImg.find((err,data)=>{
        if(err){
            console.log(err)
        }
        else{

            //this section collect id of drive to be deleted
            let array=[]
            for(let i=0; i<data[0].bookDetails.length; i++){
            
                if(data[0].bookDetails[i].driveID){
                    array.push(data[0].bookDetails[i].driveID)
                }
                if(i===data[0].bookDetails.length-1){
                    for(let j=0; j<array.length; j++){
                        deleteDriveFile(array[j])
                    }
                }
            }

            allImg.updateMany({_id:data[0]._id},{ $set: {bookDetails: []}},function(err, affected){
                 if(err){
                     console.log(err)
                     return 
                 }
                 else{
                     console.log(affected)
                 }
             })
        }
    })
}

async function deleteDriveFile_2(id){
    const oauth2Client_2=new google.auth.OAuth2(
        process.env.GOOGLE_DRIVE_CLIENT_ID_2,
        process.env.GOOGLE_DRIVE_CLIENT_SECRET_2,
        process.env.GOOGLE_DRIVE_REDIRECT_URI
    )
    oauth2Client_2.setCredentials({refresh_token:process.env.GOOGLE_DRIVE_REFRESH_TOKEN_2})
    const drive_2=google.drive({
        version:'v3',
        auth:oauth2Client_2
    })
    try{
        await drive_2.files.delete({
            fileId:id
        })
    }
    catch(err){
        console.log(err.message)
    }
}
async function deleteDriveFile(id){
    const oauth2Client=new google.auth.OAuth2(
        process.env.GOOGLE_DRIVE_CLIENT_ID,
        process.env.GOOGLE_DRIVE_CLIENT_SECRET,
        process.env.GOOGLE_DRIVE_REDIRECT_URI
    )
    oauth2Client.setCredentials({refresh_token:process.env.GOOGLE_DRIVE_REFRESH_TOKEN})
    const drive=google.drive({
        version:'v3',
        auth:oauth2Client
    })
    try{
        await drive.files.delete({
            fileId:id
        })
    }
    catch(err){
        console.log(err.message)
    }
}

function deleteAllAccomodationPost(){
    allImg.find((err,data)=>{
        if(err){
            console.log(err)
        }
        else{
            let array=[] 
            for(let i=0; i<data[0].AccomodationImg.length; i++){
                if(data[0].AccomodationImg[i].driveID){
                    array.push(data[0].AccomodationImg[i].driveID)
                }
                if(i===data[0].AccomodationImg.length-1){
                    for(let j=0; j<array.length; j++){
                        deleteDriveFile(array[j])
                        console.log(array)
                    }
                }
            }
            allImg.updateMany({_id:data[0]._id},{ $set: {AccomodationImg: []}},function(err, affected){
                 if(err){
                     console.log(err)
                     return 
                 }
                 else{
                     console.log(affected)
                    
                 }
             })
        }
    })
}
function deleteAllPostFromNotificattion(){

    Notification.find((err,data)=>{
        if(err){
            console.log(err)
        }
        else{
           
            if(data.length!==0){
                Notification.updateMany({_id:data[0]._id},{ $set: {notification:[]}},function(err, affected){
                    if(err){
                        console.log(err)
                        return 
                    }
                    else{
                       // console.log(affected)
                       
                    }
                })
            }
        }
    })
    User.find((err,data)=>{
        if(err){
            console.log(err)
        }
        else{
            
            if(data.length!==0){
                User.updateMany({_id:data[0]._id},{ $set: {notification: []}},function(err, affected){
                    if(err){
                        console.log(err)
                        return 
                    }
                    else{
                        //console.log(affected)
                        
                    }
               })
            }
            else{
                return
            }
        }
    })

}

function deletePostFromAccomodationCollection(name){
    allImg.find({"AccomodationImg.unique":name},async (err,user)=>{
        if(err){
            console.log("err")
            console.log(err)
        }
        else if(user.length!==0){
            let obj=await user[0].AccomodationImg.find((va)=>{  
               
                if(va.unique==name){
                    if(va.driveURL){
                        deleteDriveFile(va.driveURL)  
                    }
                }
                return  va.unique==name

            })
            if(obj){
                await allImg.findOneAndUpdate({_id:user[0]._id},
                    {$pull:{AccomodationImg:obj}})
            }
        }
    })
}


function deletePostFromBookCollection(name){
    allImg.find({"bookDetails.name":name},async (err,user)=>{
        if(err){
            console.log("err")
            console.log(err)
        }
        else if(user.length!==0){
            let obj=await user[0].bookDetails.find((va)=>{    
                return  va.name==name
            })
            if(obj){
                await allImg.findOneAndUpdate({_id:user[0]._id},
                    {$pull:{bookDetails:obj}})
            }
        }
    })
}



module.exports=router