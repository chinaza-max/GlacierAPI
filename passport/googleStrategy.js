//const  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User=require("../mongodb/schema/userSchema")


const googleLocalStrategy=new GoogleStrategy({
    clientID:  process.env.GoogleClientID,
    clientSecret:  process.env.GoogleClientSecret,
    callbackURL: "https://glacier-file.herokuapp.com/auth/google/callback",
  },
  async(req,token, tokenSecret, profile, done)=>{
    
     try{
    
        User.findOne({email:profile.email}).then( async(resultUser, err)=>{
            if(err){
                return done(err,null)
            } 
            else if(resultUser){
              return done(null,resultUser)
            } 
            else{
      
                const user=new User()
                user.name=profile.name.givenName,
                user.password=profile.id,
                user.email=profile.email
                user.save(function(err,data){
                    if(err){
                        return done(err,null)
                    }
                    else{
                        return done(null,data)
                    }
                })
            }
        })
     }
     catch(e){
        console.log(e)
     }
   //  return done(null, profile);
  }
)



module.exports=googleLocalStrategy;