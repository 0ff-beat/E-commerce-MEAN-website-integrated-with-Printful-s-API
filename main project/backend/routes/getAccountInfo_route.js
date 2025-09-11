const jwt = require("jsonwebtoken");
const getAccountInfo = (app,jwt_privateKey,user_model)=>{
app.post("/getAccountInfo",async (req,res)=>{
    try{
        //getting token from user
        const token = await req.body.token;
        //getting data from user token
        const userDocument = await jwt.verify(token,jwt_privateKey);
        //sending email to user
        res.json({"status":200,"email":userDocument["email"]});
    }catch(err){
        //error possibilities
        //first error -- token is melicious 
        res.json({"status":404,"message":"an error occur"})
        console.log(err)
    }

});
app.post("/getAccountFullName",async (req,res)=>{
    try{
        //getting token from user
        const token = await req.body.token;
        //getting data from user token
        const userDocument = await jwt.verify(token,jwt_privateKey);
        //extracting full from mongo db
        var document = await user_model.find({$and:[{email:userDocument["email"]},{password:userDocument["password"]}]}); 
        //sending email to user
        if(document.length != 0){
            res.json({"status":200,"fullname":document[0]["full_name"]});
        }else{
            //user not exist
            res.json({"status":404,"message":"an error occur"})
        }
    }catch(err){
        //error possibilities
        //first error -- token is melicious 
        res.json({"status":404,"message":"an error occur"})
        console.log(err)
    }

});
}
module.exports = getAccountInfo;