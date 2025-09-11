const otpsend_route = (app)=>{
    //creating otpSender route
    app.post("/otprequest",async (req,res)=>{
        //geting recipient email
        const email = await req.body.email;
        //generating random number
        var otp = Math.floor(Math.random()*1000000)
        //email sending to user
        var isOTPSent = await require("../functions/sendGMail")(email,`${otp} is your One Time Password!!!`,`Your OTP is ${otp}`);
        if(isOTPSent){
            //succeded
            res.json({
                status:200,
                otp:otp
            })
        }else{
            //an issue occur
            res.json({
                status:404,
                message:"an error occur"
            })
        }
    });
}
module.exports = otpsend_route