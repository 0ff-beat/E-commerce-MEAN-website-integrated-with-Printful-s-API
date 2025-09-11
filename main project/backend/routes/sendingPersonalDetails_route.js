const jwt = require("jsonwebtoken");
const axios = require("axios");
const circularJson = require("circular-json");
const sendingPersonalDetails = (app,user_model,jwt_privateKey)=>{
    app.post("/userPersonalInformation",async (req,res)=>{
        //getting token
        var token = await req.body.token
        //extracting data from token
        try{
            var tokenData =await jwt.verify(token,jwt_privateKey);
           //getting user information from database
            var document= await user_model.find({$and:[{email:tokenData["email"],password:tokenData["password"]}]});
            if(document.length==0){
                //no user exist
                res.json({"status":404,"message":"incorrect token"});
            }else{
                //sending user data
                res.json({"status":200,"data":document[0]});
            }
        }catch(error){
            //error possibilities
            //first error -- on verifying jwt token
            //second error -- on getting mongodb document
            console.log(error);
            res.json({"status":404,"message":"unexpected error occur"});
        }

    });
}
module.exports = sendingPersonalDetails;