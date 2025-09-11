const jwt = require("jsonwebtoken");
const comments_route = (app,comment_model,jwt_privateKey,user_model,product_model)=>{
    app.post("/getComments",async (req,res)=>{
        try{
        //getting product id
        var productID = await req.body.id;
        var number = await req.body.number;
        var pageNO = Number(number); //if this number is 1 then first 10 comments would be sending
        var allComments = await comment_model.find({product_id:productID});
        var commentslength = await allComments.length;
        var requiredComments = await getRequiredCommentsData(allComments,pageNO);
        res.json({status:200,comments:requiredComments,commentsNo:commentslength});
    }catch(error){
        console.log(error)
        res.json({status:404})
    }

    });
    async function getRequiredCommentsData(allComments,pageNo){
        var firstComment = 6*pageNo - 6;
        var j = 0;
        var requiredComments =await [];
        for(var i=firstComment;i<allComments.length;i++){
            if(j >= 6){break;}else{
                await requiredComments.push(allComments[i]);
                j++;
            }
        }
        return requiredComments;
    }
    app.post("/addComment",async (req,res)=>{
        try{
        //getting details from user
        var date =await req.body.date;
        var rating  = await req.body.rating;
        var token = await req.body.token;
        var sync_product_id = await req.body.syncProductID;
        var comment = await req.body.comment;
        var fullname = await req.body.fullname;
        //extracting token data
        var tokenData = await jwt.verify(token,jwt_privateKey);
        //extracting id from database
        var userDocument = await user_model.find({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]});
        if(userDocument.length == 0){
            //user not exist
            res.json({status:404})
        }else{
        //creating comment
        var commentDocument = await new comment_model({
        //details useful for user
        date:date,
        helpful:[],
        report:[],
        rating:rating,
        //primary details
        owner_id:userDocument[0]["_id"],
        fullname:fullname,
        product_id:sync_product_id,
        comment:comment
        });
        //saving document
        await commentDocument.save();
        //updating average rating
        var isDone = await getAverageRating(sync_product_id);
        if(isDone == true){
            //sending response
            res.json({status:200})
        }else{
            //any error occur on updating average rating
            res.json({status:404})
        }
    }
    }catch(error){
        //error possibilities
        //first error -- on getting user details
        //second error -- on saving mongo document
        console.log(error);
        //sending response
        res.json({status:404})
    }
    });
    //this function is used for calculating average rating of product
    async function getAverageRating(sync_product_id){
        try{
            var allComments = await comment_model.find({product_id:sync_product_id});
            var allRatings = await allComments.map((obj)=>{
                return Number(obj["rating"]);
            })
            // console.log(allRatings);
            var sumOfRating =0;
            for(var i=0;i<allRatings.length;i++){
                sumOfRating += allRatings[i];
            }
            var avgRating =await sumOfRating/allRatings.length;
            await product_model.updateOne({id:sync_product_id},{$set:{rating:avgRating}});
            return true;
        }catch(error){
            return false;
        }
    }
    app.post("/updateHelpful",async (req,res)=>{
        try{
            //getting require data from user
            var token = await req.body.token;
            var commentId = await req.body.commentID;
            //extracting token data
            var tokenData = await jwt.verify(token,jwt_privateKey);
            var flag = 0;
            var commentDocument = await comment_model.find({_id:commentId});
            for(var i=0;i<commentDocument[0]["helpful"].length;i++){
                var userEmail = await commentDocument[0]["helpful"][i];
                if(userEmail == tokenData["email"]){
                    flag =1;
                }else{
                    //do nothing
                }
            }
            if(flag == 0){
                //when user not liked (not clicked on helpful) 
                await comment_model.updateOne({_id:commentId},{$push:{helpful:tokenData["email"]}});
                await comment_model.updateOne({_id:commentId},{$pull:{report:{$in:[tokenData["email"]]}}});
                var commentJSON= await comment_model.find({_id:commentId});
                res.json({status:200,commentData:commentJSON[0]});
            }else if(flag == 1){    
                //when user already liked (clicked on helpful)
                await comment_model.updateOne({_id:commentId},{$pull:{helpful:{$in:[tokenData["email"]]}}});
                res.json({status:201});
            }else{
                res.json({status:404});
            }
        }catch(error){
            //errror possibilities
            //first error -- on getting require information
            //second error -- on updating mongoose model
            //third error -- on verifying jwt token 
            console.log(error);
            res.json({status:404});
        }
        });
    app.post("/updateReport",async (req,res)=>{
        try{
            //getting require data from user
            var token = await req.body.token;
            var commentId = await req.body.commentID;
            //extracting token data
            var tokenData = await jwt.verify(token,jwt_privateKey);
            var flag = 0;
            var commentDocument = await comment_model.find({_id:commentId});
            for(var i=0;i<commentDocument[0]["report"].length;i++){
                var userEmail = await commentDocument[0]["report"][i];
                if(userEmail == tokenData["email"]){
                    flag =1;
                }else{
                    //do nothing
                }
            }
            if(flag == 0){
                //when user not unliked (not clicked on report) 
                await comment_model.updateOne({_id:commentId},{$push:{report:tokenData["email"]}});
                await comment_model.updateOne({_id:commentId},{$pull:{helpful:{$in:[tokenData["email"]]}}});
                var commentJSON= await comment_model.find({_id:commentId});
                res.json({status:200,commentData:commentJSON[0]});
            }else if(flag == 1){    
                //when user already unliked (clicked on report)
                await comment_model.updateOne({_id:commentId},{$pull:{report:{$in:[tokenData["email"]]}}});
                res.json({status:201});
            }else{
                res.json({status:404});
            }
        }catch(error){
            //errror possibilities
            //first error -- on getting require information
            //second error -- on updating mongoose model
            //third error -- on verifying jwt token 
            console.log(error);
            res.json({status:404});
        }
        });
}
module.exports = comments_route;