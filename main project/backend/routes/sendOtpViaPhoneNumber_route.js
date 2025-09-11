const countries= require("countries-list");
const sendOtpViaPhoneNumber = (app,twilioNumber,twilio)=>{
    app.post("/phoneOtp",async (req,res)=>{
        try{
            //getting recipient information
            var recipient_PhoneNumber =await req.body.phonenumber;
            var recipient_country =await req.body.country;
            recipient_country = recipient_country.trim();
            //getting phone code of country
            var countriesValues = Object.values(countries["countries"])
            var country =await countriesValues.filter((countryObject)=>{
                if(countryObject["name"].toLowerCase() == recipient_country.toLowerCase()){
                    return true;
                }else{
                    return false;
                }
            });
            var phoneCode = await country[0]["phone"][0];
            //generating otp
            var otp = Math.floor(Math.random()*1000000)
            //sending SMS to recipient
            await twilio.messages.create({
                body:`your grasper otp is ${otp}`,
                from:twilioNumber,
                to:`+${phoneCode}${recipient_PhoneNumber}`
            });
            //sending data to frontend
            res.json({status:200,otp:otp});
        }catch(error){
            //error possibilities
            //first error -- on getting data from frontend
            //second error -- on getting phone code
            //third error -- on sending SMS to recipient
            console.log(error)
            res.json({status:404,message:"something went wrong"})
        }
    });
}
module.exports = sendOtpViaPhoneNumber;