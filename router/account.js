const express=require("express")
const passport=require('passport')
const router=express.Router();
const sendMail=require("../email")
const User=require("../mongodb/schema/userSchema")
const bcrypt=require('bcrypt');

//const methodOverride=require("method-override")



router.post('/login', (req, res, next)=>{
    passport.authenticate("local-login",(err, user, info) =>{
        if (err) {
            return res.status(400).json({express:err})
        }

      //for persistent  login
        req.logIn(user,(err)=>{
            if (err) {
                console.log(err)
                return res.status(500).json({express:err})
            }

            user.isAuthenticated=true;
            return res.status(200).json({express:user})
        })
    })(req, res, next);
});

router.post('/signup', (req, res, next)=>{
    passport.authenticate("local-signUp",(err, user, info) =>{
        if (err) {
            return res.status(400).json({express:err})
        }
       
            return res.status(200).json({express:user})
    
    })(req, res, next)
})

router.get("/auth/google",passport.authenticate("google-signUp",{
    scope:  [ 'profile', 'email' ]
}))

router.get("/auth/google/callback",(req, res, next)=>{
    passport.authenticate("google-signUp",(err, user, info) =>{
    
        if (err) {
            return res.status(400).json({express:err})
        }
            user.isAuthenticated=true;
            //return res.redirect(301,`http://localhost:3000/home/${user._id}`)

            //return res.redirect(301,`https://glacier-339401.web.app/home/${user._id}`)

            //res.redirect(301,`glacier-unn.netlify.app/home/${user._id}`)
            res.redirect(301,"google.com")

        
    })(req, res, next)
})


router.get('/numberOfAcc',async (req, res)=>{
   
    User.find((err,data)=>{
        if(err){
            res.json({express:"problem from server saving password"}).status(500)
            console.log(err)
           return 
        }
        else{
            console.log(data.length)
            res.json({express:data.length})
        }
    })
})

router.post('/verifyEmail', (req, res,)=>{

    User.findOne({email:req.body.email}, async(err,user)=>{
        
        if(err){
            return err
        }
        if(user){
            
                const subject="Reset your password";
                const text="click on reset link below to reset your password"
                const id=user.id
                sendMail(req.body.email,subject,text,id,(err,data)=>{
                    if(err){
                        res.status(500).json({express:"internal error"})
                    }
                    else{
                        res.json({express:"Email sent check your email to reset password"}).status(200)
                    }
                })
        }
        else{
                res.json({express:"user does not exit"})
        }
    })
});


router.post('/ResetPassword',async (req, res)=>{
   
    const hashedPassword=await bcrypt.hash(req.body.password,10)
    User.findOneAndUpdate({_id:req.body.id},{password:hashedPassword},(err,data)=>{
        if(err){
            res.json({express:"problem from server saving password"}).status(500)
            console.log(err)
           return 
        }
        else{
            res.json({express:"successfully updated"}).status(300)
        }
    })
})



module.exports=router;

//glacier-file.herokuapp.com    