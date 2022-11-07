const express = require('express');
const User=require("../mongodb/schema/userSchema")
const allImg=require("../mongodb/schema/allImg")
const Notification=require("../mongodb/schema/notificationSchema");
const router=express.Router();




router.get('/phone/:id',(req,res)=>{
    
        User.findById({_id:req.params.id},async(err,data)=>{
            if(err){
                return console.log(err)
            }
            else{
                if(data){
                    await  res.send({express:data.tel})
                }
                
            }
        })

})

router.get('/posts/:id',(req,res)=>{
    User.findById({_id:req.params.id},async(err,data)=>{
        if(err){
            return console.log(err)
        }
        else{
        
            await  res.send({express:data.details})
        }
    })
})

router.get("/detail/:name",(req,res)=>{
    let details=[];
    User.find((err,data)=>{
        if(err){
            console.log("check this route '/details/:id/:name'")
            console.log(err)
        }
        else{
            if(data){
                for(let i=0; i<data.length; i++){
                    User.findById(data[i],async(err,user)=>{
                        if(err){
                            console.log("/details/:id")
                            console.log(err)
                        }
                        else{
                           if(user){
                            let obj=user.details.find((val)=>{ return val.name==req.params.name})
                            if(obj){
                                details.push({"name":obj.name,"tel":obj.tel,"author":obj.author,
                                "title":obj.title,"faculty":obj.faculty,"description":obj.Description,"driveURL":obj.driveURL})
                                
                                res.send({express:details})
                                return;
                            }
                           }
                        }
                    })
                }
            }
          
           // res.send({express:details})
        }
    })
})

router.get('/Books',(req,res)=>{

    let mainData=[]
    let reArrangeMainData=[]
    allImg.find(async(err,data)=>{
        if(err){
            console.log(err)
        }
        else{ 
           
            if(data[0]==undefined){
                await res.send({express:[]})
            }
            else{
                console.log(data[0].bookDetails.length)
                data[0].bookDetails.forEach((data)=>{
                    if(data.name){
                        mainData.push({'name':data.name,"faculty":data.faculty,"title":data.title,"author":data.author,"driveURL":data.driveURL})
                    }
                })
                let len=mainData.length-1
                for(let i=len; 0<=i; i--){
                    reArrangeMainData.push(mainData[i])
                }
               await res.send({express:reArrangeMainData})
            }
           
        }
    })
})

router.get("/names/:id",(req,res)=>{
    
    if(req.params.id){

        User.findById(req.params.id,(err,data)=>{
            if(err){
                console.log("check this route /name/:id")
                console.log(err)
            }
            else{
                if(data){
                    if(data.tel==undefined){
                        return  res.send({express:data.name,express2:''})
                    }
                    else{
                        res.send({express:data.name,express2:data.tel})
                    }
                     
                }
                else{
                    res.send({express:"redirect"})
                }
            }
        })
    }
    else{
        res.send({express:' '})
    }
   
})


router.get("/email/:id",(req,res)=>{
    if(req.params.id){
        User.findById(req.params.id,(err,data)=>{
            if(err){
                console.log("check this route /email/:id")
                console.log(err)
            }
            else{
                if(data){
                        res.send({express:data.email})
                }
            }
        })
    }
    else{
        res.send({express:' '})
    }
   
})

router.get('/pdfAPI',(req,res)=>{
  
    let reArrangeMainData=[]
    User.find((err,data)=>{
        if(err){
            console.log("check route for error debuging '/pdfAPI'")
            console.log(err)
            return
        }
        else{   
         
               if(data){
                    if(data[0].pdfs.length!=0){
                    
                        let len=data[0].pdfs.length-1
                        for(let i=len; 0<=i; i--){
                            reArrangeMainData.push(data[0].pdfs[i])
                            if(i==0){
                                res.send({express:reArrangeMainData})
                            }
                        }   
                    }
                    else{
                        res.send({express:[]})
                    }
               }
               else{
        
                    res.send({express:[]})
               }
        }
    })

})

router.get("/accomodations",(req,res)=>{

    let mainData=[]
    let reArrangeMainData=[]
    allImg.find(async(err,data)=>{
        if(err){
            console.log(err)
        }
        else{
            if(data){
                if(data[0].AccomodationImg.length==0){
                    await res.send({express:""})
                }
                else{
                    data[0].AccomodationImg.forEach((data)=>{
                        if(data.name){
                            mainData.push({'name':data.name,"price":data.Price,"Address":data.Address,"selection":data.selection,"tel":data.tel,"id":data.id,"unique":data.unique,"driveURL":data.driveURL})
                        }
                    })
                    let len=mainData.length-1
                    for(let i=len; 0<=i; i--){
                        reArrangeMainData.push(mainData[i])
                        if(i==0){
                                resfunction()
                        }
                    }
                }
            }
            else{
                res.send({express:reArrangeMainData})
            }
         
        }
    })
 async   function  resfunction(){
        await res.send({express:reArrangeMainData})
    }
})

router.get("/notifications",(req,res)=>{
    //deleteAllPostFromNotificattion()
 
     let mainData=[]
     let reArrangeMainData=[]
     let num=0;
    /* User.find((err,data)=>{
         console.log(data[1].notification)
     })*/
     Notification.find(async(err,data)=>{
         if(err){
             console.log(err)
         }
         else{
             if(data==null){
                return res.json({express:"",express2:""})
             }
             if(data.length==0){
                 return res.json({express:"",express2:""})
             }
             else{
                 data[0].notification.forEach((data)=>{
                  
                     if(data.notification||data.title){
                         //remTime=new Date("july 9,2021 9:00:00").getTime()-data.time;
                         let remTime=data.time-new Date().getTime()
                         let second=1000;
                         let minute=second*60;
                         let hour=minute*60;
                         let day=hour*24;
                         let d=Math.floor(remTime/(day));
                        
                         if(d<1){
                             deletePostFromNotification(data.notificationID,data.userID)
                         }
                        else{
                             mainData.push({'notification':data.notification,"requestType":data.requestType,"name":data.name,
                             "tel":"contact:"+data.phone,"expiringDate":d+" days","monthPosted":data.monthPosted,"datePosted":data.datePosted,
                             "notificationID":data.notificationID,"title":data.title,"faculty":data.faculty,"bookURL":data.bookURL})
                        }
                     }
                 })
             }
             let len=mainData.length-1
             for(let i=len; 0<=i; i--){
                 reArrangeMainData.push(mainData[i])
                 if(i==0){
                         num=reArrangeMainData.length
                         resfunction()
                 }
             }
         }
     })
  async   function  resfunction(){
         await res.json({express:reArrangeMainData,express2:num})
     }
})



 function deletePostFromNotification(notificationID,id){
    Notification.find({"notification.notificationID":notificationID},async (err,notifications)=>{
        if(err){
            console.log("err")
            console.log(err)
        }
        else if(notifications.length!==0){
            let obj=await notifications[0].notification.find((va)=>{    
                return  va.notificationID==notificationID
            })

            if(obj){
                await Notification.findOneAndUpdate({_id:notifications[0]._id},
                    {$pull:{bookDetails:obj}})
            }
        }
    })



    //this delete all single post from user schema
    User.findById(id,async(err,user)=>{
        if(err){
            console.log(err)
        }
        else{
             if(user.length!==0){ 
                 let obj=await user.notification.find((va)=>{    
                     return  va.notificationID==notificationID
                 })
               
                 if(obj){
                     await User.findOneAndUpdate({_id:id},
                            {$pull:{notification:obj}})
                }
                else{
                    return
                }
            }
        }
     })
}



module.exports=router