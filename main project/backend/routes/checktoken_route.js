const checktoken  = (app,jwt,jwt_privateKey,user_model)=>{
    //creating check-token route
    app.post("/checktoken",async (req,res)=>{
        //getting token from user
        var token = await req.body.token;
        try{
            //verifing user token
            var userData = await jwt.verify(token,jwt_privateKey);
            //checking wheather token data is exist in database or not
            var document = await user_model.find({email:userData["email"]})
            if(document.length != 0){
                //when data exists
                if(document[0]["password"] == userData["password"]){
                    //when everything is correct
                    res.json({status:200,message:"true"})
                }else{
                    //when password is not matched
                    res.json({status:200,message:"false"})
                }
            }else{
                //when data not exists
                res.json({status:200,message:"false"})
            }
        }catch(err){
            //all error possibilities 
            //first error -- token get expired
            //second error -- on finding data from database
            res.json({status:404,message:"false"});
        }
    });
}
module.exports = checktoken;