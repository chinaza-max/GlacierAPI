const bcrypt=require('bcrypt');
const User=require("../mongodb/schema/userSchema")
const LocalStrategy=require('passport-local').Strategy

const loginLocalStrategy=new LocalStrategy({usernameField: 'email'},(email,password,done)=>{

   User.findOne({email},async(err,user)=>{
            if(err){
                return done(err);
            }
            if(user==null){
                    return done('user not found',null)
            }
            try{
                if(await bcrypt.compare(password,user.password)){
                    return done(null,{"id":user.id,"name":user.name})
                } 
                else{
                    return done('incorrect password or username',null)
                }
            } catch(e){
                    return done(e)
            }
    })

})

module.exports=loginLocalStrategy


