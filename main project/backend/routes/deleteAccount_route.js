const jwt = require("jsonwebtoken");
const deleteAccount_route = (app,user_model,jwt_privateKey)=>{
    app.post("/deleteAccount", async (req,res)=>{
       try{
           //get token from user
           var token = await req.body.token;
           //extract data from token
           var tokenData = await jwt.verify(token,jwt_privateKey);
           //deleting account
           await user_model.deleteOne({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]});
            //sending result to user
            res.json({status:200});
        }catch(error){console.log(error);res.json({status:404})}
    });
}
module.exports = deleteAccount_route;