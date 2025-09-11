const jwt = require("jsonwebtoken");
const checkAccountVerified = (app,jwt_privateKey,user_model)=>{
app.post("/checkVerifiedAccount",async (req,res)=>{
try{
    //getting token
    var token = await req.body.token;
    //getting token data
    var tokenData = await jwt.verify(token,jwt_privateKey);
    //checking wheather token data exists in database or not
    var document = await user_model.find({$and:[{email:tokenData["email"],password:tokenData["password"]}]});
    //checking document empty or not
    if(document.length != 0){
        //exists
        if(document[0]["phone_number"] != null){
            res.json({"status":200})
        }else{
            res.json({"status":404});
        }
    }else{
        //not exists
        res.json({"status":404})
    }
}catch(error){
    //error possibilities
    //first error -- on verifying token
    //second error -- on finding document from database
    console.log(error)
    res.json({"status":404})
}
});
app.post("/checkAccountAuth",async (req,res)=>{
    //getting token from front end
    var token = await req.body.token;
    try{
        //extracting data from token
        var tokenData = await jwt.verify(token,jwt_privateKey);
        //getting document from mongo db
       var document=  await user_model.find({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]});
       if(document.length != 0){
        //when token vailed
        res.json({"status":200})
    }else{
        //when token is invailed
        res.json({"status":404})
    }
}catch(error){
    //error possibilities
    //first error -- on verify token
    //second error -- on fetching data from mongodb
        res.json({"status":404})
    }
        
})
}
module.exports = checkAccountVerified;