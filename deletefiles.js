const fs=require('fs');
const path=require("path");
const directory="./client/public/uploads/";


function deleteFileInUpload(name){
    fs.unlinkSync(directory+name)
}

function nameOfFiles(namearr){
    for(let i=0; i<namearr.length; i++){
        deleteFileInUpload(namearr[i])
    }
}

//this handles books only
function deleteAllFiles(){
    
   
    
        const directory="./client/public/uploads/";
        fs.readdir(directory,(err,files)=>{
            if(err){
                throw err
            }
            for(const file of files){
                fs.unlink(path.join(directory,file),(err)=>{
                    if(err){
                        console.log(err)
                    }
                })
            }
        })
        deleteAllAccomodationFiles();
        deleteAllPDFFiles();
    
}
function deleteAllAccomodationFiles(){
    const directory="./client/public/Accomodation_upload/";
    fs.readdir(directory,(err,files)=>{
        if(err){
            throw err
        }
        for(const file of files){
            fs.unlink(path.join(directory,file),(err)=>{
                if(err){
                    console.log(err)
                }
            })
        }
    })
}
function deleteAllPDFFiles(){

    const directory="./client/public/uploadPDFs/";
    fs.readdir(directory,(err,files)=>{
        console.log(files)
        if(err){
            throw err
        }
        for(const file of files){
            fs.unlink(path.join(directory,file),(err)=>{
                if(err){
                    console.log(err)
                }
            })
        }
    })
}






module.exports={nameOfFiles,deleteAllFiles,deleteAllPDFFiles,deleteAllAccomodationFiles}