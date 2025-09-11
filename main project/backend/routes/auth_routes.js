const auth_routes = (app,jwt,bcrypt,jwt_privateKey,user_model,cart_model)=>{
//creating signin route
app.post("/signin",async (req,res)=>{
    //getting valid details
    var email = await req.body.email;
    var password = await req.body.password;
    //variable for handling error phase
    var cart_id = "";
    try{
        //hashing password
       var hashedPassword =await bcrypt.hash(password,10);
       //creating cart 
       var final_cart_model = await new cart_model({
        product_ids:[]
       });
       var cart_model_info = await final_cart_model.save()
       cart_id = await cart_model_info["_id"];
       //setting information to mongodb
       var final_model = await new user_model({
        email:email,
        password:hashedPassword,
        cart_id:cart_id
       })
       var user_model_info = await final_model.save();
       //creating jwt token for user
       jwt_token = await jwt.sign(JSON.parse(JSON.stringify(user_model_info)),jwt_privateKey,{expiresIn:"7d"});
       //sending data to user
       res.json({
        status:200,
        token:jwt_token //expires in 7 days
       });
    }catch(err){
        //error possibilities 
        //first error -- bcrypt password not hashed
        //second error -- mongo model error
        //third error -- On creating jwt token
        try{
            if(cart_id != ""){
                await cart_model.deleteOne({_id:cart_id});
            }
        }catch(err){
            //error possibilities
            //first error -- mongo model not delete
            console.log(err)
        }
        console.log(err)
        //sending message to user
        res.json({
            status:404
        });
    }

})
//creating login route
app.post("/login",async (req,res)=>{
    //getting information from user
    var email = req.body.email;
    var password = req.body.password;
    try{
        //finding perticular document from mongodb
        var document = await user_model.find({email:email});
        if(document.length != 0){
            //comparing user password and database password
            var isPasswordCorrect = await bcrypt.compare(password,document[0]["password"]);
            if(isPasswordCorrect){
                //when given password matched with actual password
                //creating jwt token
                var jwt_token = await jwt.sign(JSON.parse(JSON.stringify(document[0])),jwt_privateKey,{expiresIn:"7d"});
                //sending to user
                res.json({
                    status:200,
                    token:jwt_token //expires in next 7 days
                });
            }else{
                //when given password not matched with actual password
                //sending -- user is not existed
                res.json({
                    status:402,
                    message:"user not exist"
                })
            }
        }else{
            //when given email is not matching to any email in users collection
            res.json({
                status:402,
                message:"user not exist"
            })
        }
    }catch(err){
        //error possibilities
        //first error -- email is melecious
        //second error -- bcrypt password matching error
        console.log(err)
        res.json({status:404})
    }
})
app.post("/check-email-exists",async (req,res)=>{
    email = req.body.email;
    try{
        //getting data from database
    var document = await user_model.find({email:email});
    if(document.length != 0){
        //when email exists
        res.json({status:200,message:"email exists"})
    }else{
        //when email not exists
        res.json({status:200,message:"email not exists"})
    }
    }catch(err){
        //error possibilities
        //first error -- milicious email
        console.log(err); 
        res.json({status:404})
    }
})
}
module.exports = auth_routes;