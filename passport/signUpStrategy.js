const bcrypt=require('bcrypt');
const User=require("../mongodb/schema/userSchema")
const LocalStrategy=require('passport-local').Strategy


const signUpLocalStrategy=new LocalStrategy({passReqToCallback:true, usernameField: 'email'},
                            (req,email,password,done)=>{
   const user=new User()
   User.findOne({email}).then( async(resultUser, err)=>{
       console.log(resultUser)
        if(err){
            return done(err,null)
        } 
        if(resultUser){
                return done("user already exit with that credencial @",null)
        }
        else{
            User.findOne({tel:req.body.tel}).then( async(resultUser, err)=>{
                if(err){
                    return done(err,null)
                } 
                else if(resultUser){
                    return done("user already exit with that credencial !!",null)
                }
                else{
                    try{ 
                        const hashedPassword=await bcrypt.hash(req.body.password,10)
                        user.name=req.body.name,
                        user.password=hashedPassword,
                        user.email=req.body.email,
                        user.state=req.body.state,
                        user.tel=req.body.tel
                        user.save(function(err,data){
                            if(err){
                                return done(err,null)
                            }
                            else{
                                 return done(null,"saved")
                            }
                        })
                    }
                    catch(err){
                        return done(err,null)
                    }
                }
            })
        }
    })

})

module.exports=signUpLocalStrategy;