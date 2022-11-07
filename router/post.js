const express = require('express');
const app = express();
const path=require("path")
const User=require("../mongodb/schema/userSchema")
const allImg=require("../mongodb/schema/allImg")
const Notification=require("../mongodb/schema/notificationSchema")
const pdf = require('pdf-parse');
const fs=require('fs');
var axios = require("axios").default;
const router=express.Router();
const crypto=require("crypto");
const {google} = require('googleapis');
const fileUpload = require('express-fileupload');
app.use(fileUpload());
const Time=require("../Time");
const {Duplex} = require('stream');
const { file } = require('googleapis/build/src/apis/file');

const oauth2Client=new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
)

const oauth2Client_2=new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID_2,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET_2,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
)



router.post('/Accomodation_upload/:id',async(req,res)=>{
    let id=req.params.id

    if(req.files==null){
        let file= { name:'',data:'',size: 0,tempFilePath: '',mimetype: '', md5: '',Price: '',Address: '',selection: '',tel: ''}
                crypto.randomBytes(16,async (err,buf) => {
                        if (err) {
                            return   console.log(err)
                        }
                        else{
                            const filename =await buf.toString('hex') + path.extname(req.body.selection);
                            file.unique=filename
                        }
                    }
                )
                file.name="/accomodationImg/firstImg.jpg";
                file.Price=req.body.Price;
                file.Address=req.body.Address
                file.selection=req.body.selection;
                file.tel=req.body.tel;
                file.id=id
                
                await User.findOneAndUpdate({_id:id},{$push:{AccomodationImg:file}})
                
                //initializing book schema to actual get an ID
                allImg.find(async(err,data)=>{
                    
                    if(err){
                            console.log(err)
                    }
                    else{
                        if(data.length>=1){
                          
                                    await allImg.findOneAndUpdate({_id:data[0].id},{$push:{AccomodationImg:file}})
                        }
                        else{
                            await new allImg({AccomodationImg:["test"]}).save()
                            allImg.find(async(err,data)=>{
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    await allImg.findOneAndUpdate({_id:data[0].id},{$push:{AccomodationImg:file}})
                                }
                            
                            })
                        }
                    }
                })
        return res.json({message:"success"})
    }
    else{
  
        const file=req.files.file;
        if(file.mimetype.toLowerCase()=="image/jpeg"||file.mimetype.toLowerCase()=="image/png"||file.mimetype.toLowerCase=="image/jpg"){
            crypto.randomBytes(16,async (err,buf) => {
                if (err) {
                    return   console.log(err)
                }
                else{
                    const filename =await buf.toString('hex') + path.extname(file.name);
            
                    if(filename){
                        file.name="/Accomodation_upload/"+filename
                        file.Price=req.body.Price
                        file.Address=req.body.Address
                        file.selection=req.body.selection
                        file.tel=req.body.tel
                        file.id=id
                        file.unique=filename
                       /* file.mv( `${__dirname}../../client/public${file.name}`,async(err)=>{
                            if(err){
                                console.log(err)
                                return res.status(500).send(err)
                            }
                            file.data='';
                            file.size=0;
        
                            })*/
                            oauth2Client.setCredentials({refresh_token:process.env.GOOGLE_DRIVE_REFRESH_TOKEN})
                            const drive=google.drive({
                                version:'v3',
                                auth:oauth2Client
                            })
                            function bufferToStream(myBuuffer) {
                                let tmp = new Duplex();
                                tmp.push(myBuuffer);
                                tmp.push(null);
                                return tmp;
                            }
                            async function uploadFile(buffer){
                                try{
                                    const response=await drive.files.create({
                                        requestBody:{
                                            name:file.name,
                                            mimeType:file.mimetype
                                        },
                                        media:{
                                            mimeType:file.mimetype,
                                            body:bufferToStream(buffer)
                                        }
                                    
                                    })
                                    await drive.permissions.create({
                                            fileId:response.data.id,
                                            requestBody:{
                                                role:"reader",
                                                type:"anyone"
                                            }
                                    })
                                    const result= await drive.files.get({
                                        fileId:response.data.id,
                                        fields:'webViewLink, webContentLink, thumbnailLink'
                                    })
                                 
                                    file.data=''
                                    file.driveID=response.data.id
                                    file.driveURL=`https://drive.google.com/uc?export=view&id=${response.data.id}`
    
                                   
                            await User.findOneAndUpdate({_id:id},{$push:{AccomodationImg:file}})
                            //initializing book schema to actual get an ID
                            allImg.find(async(err,data)=>{
                                
                            if(err){
                                    console.log(err)
                            }
                            else{
                                    if(data.length>=1){
                                        allImg.find(async(err,data)=>{
                                            if(err){
                                                console.log(err)
                                            }
                                            else{
                                                await allImg.findOneAndUpdate({_id:data[0].id},{$push:{AccomodationImg:file}})
                                            }
                                        
                                        })
                                    }
                                    else{
                                        await new allImg({AccomodationImg:["test"]}).save()
                                        allImg.find(async(err,data)=>{
                                            if(err){
                                                console.log("check this route /Accomodation_upload/:id")
                                                console.log(err)
                                            }
                                            else{
                                                await allImg.findOneAndUpdate({_id:data[0].id},{$push:{AccomodationImg:file}})
                                            }
                                        
                                        })
                                    }
                            }
                            })
                            
                            res.json({message:"success"})
                            
                            }catch(error){

                                console.log(error.message)
                            }
                        }
                        uploadFile(file.data)
                    }
                }
            })
        }
        else{
            res.json({fileName:'',filePath:'',errMessage:'file extension not supported '});
        }
    }
})

router.post("/uploadPDF/:id",(req,res)=>{
    const id=req.params.id
   
    if(req.files===null){
    return res.status(400).json({msg:"No file uploaded"});
    }
    const file=req.files.file;

    if(file.mimetype.toLowerCase()=="application/pdf"){
        crypto.randomBytes(16,async (err,buf) => {
            if (err) {
                return   console.log(err)
            }
            const filename = buf.toString('hex') + path.extname(file.name);
            await filename
            
            if(filename){
                file.name=filename
                file.courseCode=req.body.courseCode.toLowerCase()

                     //part handles upload to google drive
                     oauth2Client_2.setCredentials({refresh_token:process.env.GOOGLE_DRIVE_REFRESH_TOKEN_2})
                     const drive_2=google.drive({
                         version:'v3',
                         auth:oauth2Client_2
                     })
                     function bufferToStream(myBuuffer) {
                         let tmp = new Duplex();
                         tmp.push(myBuuffer);
                         tmp.push(null);
                         return tmp;
                     }
                     async function uploadFile(buffer){
                        try{
                            const response=await drive_2.files.create({
                                requestBody:{
                                    name:file.name,
                                    mimeType:file.mimetype
                                },
                                media:{
                                    mimeType:file.mimetype,
                                    body:bufferToStream(buffer)
                                }
                            
                            })
                            await drive_2.permissions.create({
                                    fileId:response.data.id,
                                    requestBody:{
                                        role:"reader",
                                        type:"anyone"
                                    }
                            })
                            const result= await drive_2.files.get({
                                fileId:response.data.id,
                                fields:'webViewLink, webContentLink, thumbnailLink'
                            })
                         
                            file.data=''
                            file.driveID=response.data.id
                            file.driveURL=result.data.webViewLink
                            console.log(result.data.webViewLink)
                            console.log(result.data.webContentLink)
                    //let dataBuffer = fs.readFileSync( `${__dirname}../../client/public/uploadPDFs/${file.name}`)
                  /*  pdf(dataBuffer).then(function(data) {
 
                        // number of pages
                       // console.log(data.numpages);
                        // number of rendered pages
                        //console.log(data.numrender);
                        // PDF info
                       // console.log(data.info);
                        // PDF metadata 
                       // console.log(data.metadata);
                        // PDF.js version
                        // check https://mozilla.github.io/pdf.js/getting_started/
                       // console.log(data.version);
                        // PDF text
                       // console.log(data.text); 
                            
                    });
                        */
                    if(err){
                        console.log(err)
                        return res.status(500).send(err)
                    }
                    else{
                        
                       uploadRequest2(req.body.courseCode,"PDF",filename,id)
                    
                        res.json({message:"success"})
                        await User.findOneAndUpdate({_id:id},{$push:{pdfs:file}})
                    }
               
                    }catch(error){

                        console.log(error.message)
                    }
                }
                uploadFile(file.data)
            }
        })
    }
    else{
        res.json({fileName:'',filePath:'',errMessage:'file extension not supported '});
    }
})

router.post('/uploadBook/:id',(req,res)=>{

    const id=req.params.id
    if(req.files===null){
        return res.status(400).json({msg:"No file uploaded"});
    }
    const file=req.files.file;
    
    if(file.mimetype.toLowerCase()=="image/jpeg"||file.mimetype.toLowerCase()=="image/png"){
        crypto.randomBytes(16,async (err,buf) => {
            if (err) {
                return   console.log(err)
            }
            else{
                const filename = buf.toString('hex') + path.extname(file.name);
                await filename
                if(filename){
                    file.name=filename
                    file.author=req.body.author.toLowerCase()
                    file.title=req.body.title.toLowerCase()
                    file.faculty=req.body.faculty.toLowerCase()
                    file.Description=req.body.Description.toLowerCase()
                    file.tel=req.body.tel
                    file.date=Time().year + "-" + Time().month + "-" +Time().date

                    oauth2Client.on('tokens', (tokens) => {
                        if (tokens.refresh_token) {
                          // store the refresh_token in my database!
                          console.log(tokens.refresh_token);
                        }
                        console.log(tokens.access_token);
                      });
                        //part handles upload to google drive
                        oauth2Client.setCredentials({refresh_token:process.env.GOOGLE_DRIVE_REFRESH_TOKEN})
                        const drive=google.drive({
                            version:'v3',
                            auth:oauth2Client
                        })
                        function bufferToStream(myBuuffer) {
                            let tmp = new Duplex();
                            tmp.push(myBuuffer);
                            tmp.push(null);
                            return tmp;
                        }
                        async function uploadFile(buffer){
                            try{
                                console.log("step1")
                                const response=await drive.files.create({
                                    requestBody:{
                                        name:file.name,
                                        mimeType:file.mimetype
                                    },
                                    media:{
                                        mimeType:file.mimetype,
                                        body:bufferToStream(buffer)
                                    }
                                
                                })
                                await drive.permissions.create({
                                        fileId:response.data.id,
                                        requestBody:{
                                            role:"reader",
                                            type:"anyone"
                                        }
                                })
                                const result= await drive.files.get({
                                    fileId:response.data.id,
                                    fields:'webViewLink, webContentLink, thumbnailLink'
                                })
                                console.log("step2")
                                file.data=''
                                file.driveID=response.data.id
                                file.driveURL=`https://drive.google.com/uc?export=view&id=${response.data.id}`

                
                                uploadRequest2(req.body.title,req.body.faculty,filename,id)
                                
                                await User.findOneAndUpdate({_id:id},{$push:{details:file}})
                                //initializing book schema to actual get an ID
                                allImg.find(async(err,data)=>{
                                   if(err){
                                        console.log("check book upload route  'allImg'")
                                        console.log(err)
                                   }
                                   else{
        
                                        if(data.length>=1){
                                        
                                                    await allImg.findOneAndUpdate({_id:data[0].id},{$push:{bookDetails:file}})
                                                    res.json({message:"success"})
                                        }
                                        else{
                                           
                                            await new allImg({bookDetails:["test"]}).save()
                                            allImg.find(async(err,data)=>{
                                              
                                                if(err){
                                                    console.log(err)
                                                }
                                                else{
                                                    await allImg.findOneAndUpdate({_id:data[0].id},{$push:{bookDetails:file}})
                                                    res.json({message:"success"})
                                                }
                                            
                                            })
                                        }
                                    }
                                })
                        
                            }catch(error){

                                console.log(error.message)
                            }
                        }
                        uploadFile(file.data)
                }
            }
           
        })
    }
    else{
        res.json({fileName:'',filePath:'',errMessage:'file extension not supported '});
    }
       
})

//this route handles users request base on accomodation 
router.post("/uploadRequest/:id",(req,res)=>{
    const {id}=req.params;
  //deleteAllPostFromNotificattion()
    User.findById(id,async(err,user)=>{
        if(err){
            console.log("/uploadRequest/:id")
            console.log(err)
            res.status(500).json({error:"issues finding user"})
        }
        else{
            crypto.randomBytes(16,async (err,buf) => {
                if (err) {
                    return   console.log(err)
                }
                else{
                    const notificationID = buf.toString('hex') + path.extname(id)
                    let endEvent=new Date()
                    endEvent.setDate(new Date().getDate()+10)
                    const file={"title":'',"faculty":'',"bookURL":'',"notificationID":'',
                        "userID":'',"notification":'',"requestType":'',"name":'',"phone":'',
                        "time":'',"monthPosted":'',"datePosted":''}
                    let months=["jan","feb","mar","apr","may","jun","july","aug","sep","oct","nov","dec"]
                    file.notificationID=notificationID
                    file.userID=id
                    file.notification=req.body.notification
                    file.requestType=req.body.selection
                    file.name=await user.name
                    file.phone=await user.tel
                    file.time=endEvent.getTime()
                    file.monthPosted=months[new Date().getMonth()]
                    file.datePosted=new Date().getDate()
                    Notification.find(async(err,data)=>{
                        if(err){
                                console.log(err)
                                res.status(500)
                        }
                        else{
                            await User.findOneAndUpdate({_id:id},{$push:{notification:file}})
                            if(data.length>0){
                                Notification.find(async(err,data)=>{
                                    if(err){
                                        console.log(err)
                                        res.status(500)
                                    }
                                    else{
                                        await Notification.findOneAndUpdate({_id:data[0].id},{$push:{notification:file}})
                                    }
                                })
                                res.status(200).json({express:"success"})
                            }
                            else{
                                await new Notification({notification:["test"]}).save()
                                Notification.find(async(err,data)=>{
                                    if(err){
                                        console.log(err)
                                    }
                                    else{
                                        await Notification.findOneAndUpdate({_id:data[0].id},{$push:{notification:file}})
                                    }
                                
                                })
                                res.status(200).json({express:"success"})
                            }
                        }
                    })
                }
            })
        }
    })
})

router.post('/deletePost/:id/:name',(req,res)=>{
    let id=req.params.id;
    let imgNames=req.params.name.split(",");
    let imgSize=imgNames.length-1
    //console.log(imgName)
    
    for(imgName in imgNames ){
    
        deletePostFromBookCollection(imgNames[imgName]);
    }

    User.findById(id,async(err,user)=>{
       if(err){
           console.log("check post route /deletePost/:id/:name")
           console.log(err)
       }
       else{
            for(imgName in imgNames ){
                let obj=user.details.find((va)=>{    
                    return  va.name== imgNames[imgName]
                })
                if(obj){
                    await User.findOneAndUpdate({_id:req.params.id},
                        {$pull:{details:obj}})
                        if(imgName==imgSize){
                            response()
                        }
                }
            }
       }
    })
    function response(){
        res.json({express:"successful"})
    }
})


//this function help you upload notification when a user upload text book or pdf
function uploadRequest2(title,faculty,bookURL,id){
  
    crypto.randomBytes(16,async (err,buf) => {
    
        if (err) {
         
            return   console.log(err)
        }
        else{
            
            const notificationID = buf.toString('hex') + path.extname(id)
            const file={"title":'',"faculty":'',"bookURL":'',"notificationID":'',
                "userID":'',"notification":'',"requestType":'',"name":'',"phone":'',
                "time":'',"monthPosted":'',"datePosted":''}
            let months=["jan","feb","mar","apr","may","jun","july","aug","sep","oct","nov","dec"]
            let endEvent=new Date()
            endEvent.setDate(new Date().getDate()+10)
            file.notificationID=notificationID
            file.title=title
            file.faculty=faculty
            file.bookURL=bookURL
            file.userID=id
            file.time=endEvent.getTime()
            file.monthPosted=months[new Date().getMonth()]
            file.datePosted=new Date().getDate()
            Notification.find(async(err,data)=>{
                if(err){
                    
                        console.log(err)
                }
                else{
                    await User.findOneAndUpdate({_id:id},{$push:{notification:file}})
                    if(data.length>0){
                        Notification.find(async(err,data)=>{
                            if(err){
                                console.log(err)
                            }
                            else{
                                await Notification.findOneAndUpdate({_id:data[0].id},{$push:{notification:file}})
                             
                            }
                        })
                    }
                    else{
                        await new Notification({notification:["test"]}).save()
                        Notification.find(async(err,data)=>{
                            if(err){
                                console.log(err)
                            }
                            else{
                                await Notification.findOneAndUpdate({_id:data[0].id},{$push:{notification:file}})
                            }
                        
                        })
                    }
                   
                }
            })
        }
        return 
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
                if(va.name==name){
                    deleteDriveFile(va.driveID)
                    console.log("chinaza chinaza chinaza chinazachinazachinazachinaza")
                    console.log(va.driveID)
                    console.log("chinaza chinaza chinaza chinazachinazachinazachinaza")
                }
                return  va.name==name
            })
            if(obj){
                await allImg.findOneAndUpdate({_id:user[0]._id},
                    {$pull:{bookDetails:obj}})
            }
        }
    })
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





module.exports=router;


