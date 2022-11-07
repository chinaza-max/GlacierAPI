const passport=require('passport')
const User=require("../mongodb/schema/userSchema")
const googleStrategy=require("./googleStrategy")
const signUpStrategy=require("./signUpStrategy")
const loginStrategy=require("./loginStrategy")




passport.serializeUser((user,done)=>done(null,user.id))
passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
        if(err){return done(err)}
        done(null,user)
    })
})


passport.use("local-signUp",signUpStrategy)
passport.use("local-login",loginStrategy)
passport.use("google-signUp",googleStrategy)

module.exports=passport