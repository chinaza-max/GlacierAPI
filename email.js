require('dotenv').config(); 
const nodemailer=require('nodemailer');





let auth = {
    type: 'oauth2',
    user: 'brightmind.lmt@gmail.com',
    clientId: '349313805948-fuc15p5cm97hr1nsme1bt55m32dtek7e.apps.googleusercontent.com',
    clientSecret: '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',
    refreshToken: '1//04SRSJKPMND2ECgYIARAAGAQSNwF-L9IrrVCA3QVfuS96o1pNQrY0ny_4NpzaF1QMTRx5LUtXs2M3i5HVN-hUZGiwmEu-HAxNcvQ',
};

const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:auth
});

const sendMail=(email,subject,text,id,cb)=>{
    const mailOptions={
        from:"brightmind.lmt@gmail.com",
        to:email,
        subject,
        text,
        html:`     <div style="width: 90%; margin: 0 auto;">
                        <div style="text-align: center;">----------------------------------------- </div>
                            <h2 style="text-align: center;">Glacier</h2>
                        <div style="text-align: center;">----------------------------------------- </div>
                    
                        <p style="text-align: center;">your are welcome click on reset to change password </p>
                        <div style="text-align: center;"><a href=https://glacier-file.herokuapp.com/resetPassword/${id}> RESET</a> </div>
                    </div>
                    `
    }
    
    transporter.sendMail(mailOptions,function(err,data){
        console.log(email)
            if(err){
                console.log(err)
                cb(err,null)
            }
            else{
                cb(null,data)
            }
    });
    
}

module.exports=sendMail;


