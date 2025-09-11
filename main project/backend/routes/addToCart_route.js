const jwt = require("jsonwebtoken"); 
const addToCart_route = (app,cart_model,jwt_privateKey,user_model,product_model)=>{
    app.post("/addProductToCart",async (req,res)=>{
        try{
            //getting user information
            var token = await req.body.token;
            var syncProductID = await req.body.productID;
            var catalogProductID = await req.body.catalogProductID;
            var variantID = await req.body.variantID;
            var productQuantity = await req.body.quantity; 
            //getting token data
            var tokenData = await jwt.verify(token,jwt_privateKey);
            //getting cart id
            var userDocument = await user_model.find({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]});
            if(userDocument.length == 0){
                //when user not exist
                res.json({status:404,message:"create account for futher operations"})
            }else{
                //when user exist
                var cartID = await userDocument[0]["cart_id"];
                await cart_model.updateOne({_id:cartID},{$push:{product_ids:{productID:syncProductID,quantity:productQuantity,variantID:variantID,catalogProductID:catalogProductID}}});
                res.json({status:200});
            }
        }catch(error){
            console.log(error)
            res.json({status:404,message:"unexpected error occur"})
        }
    });
    //for /product-details
    app.post("/CheckProduct_AddedToCart",async (req,res)=>{
        try{
            //getting required informtaion
            var token = await req.body.token;
            var productID = await req.body.productID;
            //getting token data
            var tokenData= await jwt.verify(token,jwt_privateKey);
            var userDocument= await user_model.find({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]}); 
            if(userDocument.length == 0){
                //when user not exist
                res.json({status:404})
            }else{
                var cartID= await userDocument[0]["cart_id"];
                var cartDocument= await cart_model.find({_id:cartID});
                var finalArray = await cartDocument[0]["product_ids"].filter((productid)=>{
                    if(productid["productID"] == productID){
                        return true;
                    }else{
                        return false;
                    }
                });
                if(finalArray.length == 0){
                    //when product not exist in cart
                    res.json({status:200,exist:false})
                }else{
                    //when  product exist in cart
                        res.json({status:200,exist:true,cart:finalArray})
                }
            }
        }catch(error){console.log(error);res.json({status:404})}
    });
    //for /cart
    app.post("/getAllItemsInCart",async (req,res)=>{
        try{
            //get required informtaion
            var token = await req.body.token;
            //extract data from token
            var tokenData = await jwt.verify(token,jwt_privateKey);
            //getting cart ID
            var userDocument = await user_model.find({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]});
            if(userDocument.length == 0){
                //when user not exist
                res.json({status:404});
            } else{
                //when user exist
                var cartID = await userDocument[0]["cart_id"];
                var cartDocument = await cart_model.find({_id:cartID});
                var reqData = await gettingCartAllProductsData(cartDocument);
                res.json({status:200,cart:cartDocument[0],data:reqData});
            }
        }catch(error){console.log(error);res.json({status:404})}
    });
    async function gettingCartAllProductsData(cartDocument){
        var variants_Details = [];
        for(var i=0;i<cartDocument[0]["product_ids"].length;i++){
            //getting product data
            var productID = await cartDocument[0]["product_ids"][i]["productID"];
            var productDocument = await product_model.find({id:productID});
            //getting variant data
            for(var j=0;j<productDocument[0]["sync_variants"].length;j++){
                if(productDocument[0]["sync_variants"][j]["id"] == cartDocument[0]["product_ids"][i]["variantID"]){
                    var variantColor = productDocument[0]["sync_variants"][j]["color"]; 
                    var variantRetail_price = productDocument[0]["sync_variants"][j]["retail_price"]; 
                    var variantName = productDocument[0]["sync_variants"][j]["name"]; 
                    var variantCurrency = productDocument[0]["sync_variants"][j]["currency"];
                    await variants_Details.push({color:variantColor,retail_price:variantRetail_price,title:variantName,currency:variantCurrency});
                    break;
                }else{}
            }
            if(productDocument[0]["mock_up_images"][0]["color"] == ""){
                //when colors are not available
                variants_Details[i].image= await productDocument[0]["mock_up_images"][0]["front"];
            }else{
                // console.log(productDocument[0]["mock_up_images"])
                var imgObj = await productDocument[0]["mock_up_images"].filter((obj)=>{
                    if(obj["color"] == variants_Details[i]["color"]){
                        return true;
                    }else{
                        return false;
                    }
                });
                variants_Details[i].image = await imgObj[0]["front"];
            }
            
        }
        return variants_Details
    }
    app.post("/updateCartProductQuantity",async (req,res)=>{
        try{
            //getting required information
            var token= await req.body.token;
            var quantity = await req.body.quantity;
            var syncProductID = await req.body.syncProductID; 
            //extracting data from token
            var tokenData = await jwt.verify(token,jwt_privateKey);
            var userDocument = await user_model.find({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]});
            if(userDocument.length == 0){
                //when user not exist
                res.json({status:404})
            }else{
                //when user exist
                var cartID = await userDocument[0]["cart_id"];
                var cartDocument = await cart_model.find({_id:cartID});
                for(var i=0;i<cartDocument[0]["product_ids"].length;i++){
                    var obj = cartDocument[0]["product_ids"][i];
                    if(obj["productID"] == syncProductID){
                        obj["quantity"] = quantity;
                        break;
                    }
                }
                // console.log(cartDocument);
                await cart_model.updateOne({_id:cartID},{$set:{product_ids:cartDocument[0]["product_ids"]}});
                res.json({status:200});
            }
        }catch(error){console.log(error);res.json({status:404})}
    });
    app.post("/updateCartVariant",async (req,res)=>{
        try{
            //getting required information
            var token= await req.body.token;
            var variantID = await req.body.variantID;
            var syncProductID = await req.body.syncProductID; 
            //extracting data from token
            var tokenData = await jwt.verify(token,jwt_privateKey);
            var userDocument = await user_model.find({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]});
            if(userDocument.length == 0){
                //when user not exist
                res.json({status:404})
            }else{
                //when user exist
                var cartID = await userDocument[0]["cart_id"];
                var cartDocument = await cart_model.find({_id:cartID});
                for(var i=0;i<cartDocument[0]["product_ids"].length;i++){
                    var obj = cartDocument[0]["product_ids"][i];
                    if(obj["productID"] == syncProductID){
                        obj["variantID"] = variantID;
                        break;
                    }
                }
                // console.log(cartDocument);
                await cart_model.updateOne({_id:cartID},{$set:{product_ids:cartDocument[0]["product_ids"]}});
                res.json({status:200});
            }
        }catch(error){console.log(error);res.json({status:404})}
    });
    app.post("/deleteCartItems",async (req,res)=>{
        try{
            //getting information from user 
            var token = await req.body.token;
            var syncProductID =await req.body.productID;
            //extracting token data
            var tokenData = await jwt.verify(token,jwt_privateKey);
            var userDocument = await user_model.find({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]});
            if(userDocument.length == 0){
                //when user not exist in database
                res.json({status:404});
            }else{
                //when user exist in database
                var cartID = await userDocument[0]["cart_id"];
                var cartDocument = await cart_model.find({_id:cartID});
                var newCartDocument = await cartDocument[0]["product_ids"].filter((obj)=>{
                    if(obj["productID"] == syncProductID){
                        return false;
                    }else{
                        return true;
                    }
                });
                await cart_model.updateOne({_id:cartID},{$set:{product_ids:newCartDocument}});
                res.json({status:200});
            }
        }catch(error){console.log(error);res.json({status:404})}
    });
    //for individual product components
    app.post("/getVariantNumberByProductID",async (req,res)=>{
        try{
            //getting required information
            var token = await req.body.token;
            var syncProductID = await req.body.productID;
            //extracting data from token
            var tokenData = await jwt.verify(token,jwt_privateKey);
            var userDocument = await user_model.find({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]});
            if(userDocument.length == 0){
                //when user not exist
                res.json({status:404});
            }else{
                //when user exists
                //getting cart id
                var cartID = await userDocument[0]["cart_id"];
                var cartDocument= await cart_model.find({_id:cartID});
                var finalArray = await cartDocument[0]["product_ids"].filter((obj)=>{
                    if(obj["productID"] == syncProductID){
                        return true;
                    }else{
                        return false;
                    }
                });
                if(finalArray.length == 0){
                    //when product not in cart
                    res.json({status:201});
                }else{
                    //when product in cart
                    var ProductDocument = await product_model.find({id:syncProductID});
                    var flagI = -1;
                    for(var i=0;i<ProductDocument[0]["sync_variants"].length;i++){
                        if(ProductDocument[0]["sync_variants"][i]["id"] == finalArray[0]["variantID"]){
                            flagI = i;
                            break;
                        }
                    };
                    if(flagI == -1){
                        //when variant id in cart is wrong;
                        res.json({status:404});
                    }else{
                        res.json({status:200,i:flagI});
                    }
                }
            }
        }catch(error){console.log(error);res.json({status:404})}
    });
    app.post('/calcSubtotal',(req,res)=>{
        try{
            //get price and quantity of products (assuming currency are in dollar)
            //data look like ---> [{"price":"449","quantity":"1"},{"price":"44","quantity":"5"}]
            var data = req.body.data;
            var priceSum = 0;
            for(var i=0;i<data.length;i++){
                priceSum += Number(data[i]["price"])*Number(data[i]["quantity"]);
            };
            res.json({status:200,subtotal:priceSum.toFixed(2)});
        }catch(error){console.log(error);res.json({status:404})}
});
app.post("/calcTotal",(req,res)=>{
    var subtotal = req.body.subtotal;
    var shipping = req.body.shipping;
    var total = Number(shipping)+Number(subtotal);
    res.json({status:200,total:total.toFixed(2)});
})
    
}
module.exports = addToCart_route;