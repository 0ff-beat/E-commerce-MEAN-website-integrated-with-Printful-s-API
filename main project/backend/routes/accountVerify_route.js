const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const accountVerify= (app,user_model,jwt_privateKey)=>{
 app.post("/verifyAccount",async (req,res)=>{
    //getting user data
    var userData = await req.body.data;
    //getting user token
    var userToken = await req.body.token;
    //retriving user token data
    var userTokenData = await checkingUserToken(userToken);
    userTokenData = await userTokenData["data"];
    try{
        //updating data in database
        var updateDocument = await {$set:{
            full_name: userData["fullname"],
        address: userData["address"],
        opt_address: userData["optaddress"],
        country: userData["country"],
        state: userData["state"],
        city: userData["city"],
        zip: userData["zip"],
        phone_number: userData["phonenumber"]
        }}
        var result = await user_model.updateOne({$and:[{email:userTokenData["email"]},{password:userTokenData["password"]}]},updateDocument);
        //checking modification
        if(result.modifiedCount > 0){
            res.json({"status":200});
        }else{
            res.json({"status":404});
        }
    }catch(error){
        //error possibilities
        //first error -- on getting data
        //second error -- on updating data
        console.log(error);
        res.json({"status":404});
    }
 });
 async function checkingUserToken(userToken){
     //getting data from json token
    try{
        var userData = await jwt.verify(userToken,jwt_privateKey);
        return {"data":userData};
    }catch(error){
        console.log(error)
        return {"data":"error"};
    }
 }
}
module.exports = accountVerify;