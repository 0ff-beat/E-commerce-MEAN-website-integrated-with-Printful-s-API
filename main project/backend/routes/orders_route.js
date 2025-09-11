const orderClass = require("../classes/order");
const jwt = require("jsonwebtoken");
const orders_route = (app,jwt_privateKey,user_model,orders_model,printful_apiKey,product_model,cart_model)=>{
    app.post("/createOrder",async (req,res)=>{
        //getting required data from front end;
        // console.log("order placed")
        var shippingData = await req.body.shippingData; //look like --> {shippingName:STANDARD,Total:43,shippingCost:54}
        var itemsPurchase = await req.body.itemsData; // look like --> [{syncVariantID:435,syncProductID:43}];
        var userAddressData= await req.body.userAddress; //look like --> {address1:nandpuri,address2:bhagwatinagar,country:india,state:jammu,city:ban,phoneNumber:439485};
        var token = await req.body.token; // it is a string;
        try{
            //extracting data from token;
            var tokenData = await jwt.verify(token,jwt_privateKey);
        }catch(error){console.log(error);res.json({status:404,message:"incorrect token"})} //error on extracting token's data
        try{
            //finding user's mongoDB document
            var userDocument = await user_model.find({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]});
            if(userDocument.length == 0){//when user not existed in mongoDB;
                res.json({status:404,message:"not existed user"})
            }else{//when user existed in mongoDB;
                const orderObject = new orderClass();
                var countryStateCodes = await orderObject.getCodes(userDocument[0]["country"],userDocument[0]["state"],printful_apiKey);
                var allItems = await orderObject.getItemsPurchase(itemsPurchase,product_model);
                var resultOrderData = await orderObject.requestForOrder(shippingData,allItems,countryStateCodes,userDocument[0],userAddressData,printful_apiKey);
                var isUserFirstTimePurchase = await orderObject.isUserFirstTimePurchase(orders_model,userDocument[0]["_id"]);
                var orderedProductImages = await orderObject.getOrderedProductImages(itemsPurchase,product_model);
                if(isUserFirstTimePurchase){
                    await orderObject.saveOrderToMongoDB(orders_model,userDocument[0]["_id"],resultOrderData,orderedProductImages);
                }else{
                    await orderObject.addOrderToMongoDB(orders_model,userDocument[0]["_id"],resultOrderData,orderedProductImages);
                }
                var responseGmail = await orderObject.sendSuccessGmail(resultOrderData,userDocument[0]);
                if(responseGmail){
                    //removing items from cart if exist
                    await orderObject.emptyCart(userDocument[0]["cart_id"],cart_model);
                    res.json({status:200});
                }else{
                    res.json({status:404,message:"unexpected error occur!!!"})
                }
            }
        }catch(error){console.log(error);res.json({status:404,message:"not existed user"})} // error on finding user's mongoDB document
    });
    app.post("/getOrders",async (req,res)=>{
        try{
            var token = req.body.token //user token is a string
            var tokenData = await jwt.verify(token,jwt_privateKey);
            var userDocument = await user_model.find({$and:[{email:tokenData["email"]},{password:tokenData["password"]}]});
            if(userDocument.length == 0){
                res.json({status:404,message:"user not exist in DB"});
            }else{
                var userID = await userDocument[0]["_id"];
                var orderObject = new orderClass();
                var orderDoc = await orderObject.getOrders(userID,orders_model);
                if(orderDoc == null){
                    res.json({status:404,message:"unexpected error occur!!!"});
                }else{
                    res.json({status:200,data:orderDoc});
                }
            }
        }catch(error){ console.log(error);res.json({status:404,message:"unexpected error occur!!!"})}
    });
}
module.exports = orders_route;
// {
//     "shipping": "STANDARD",
//     "recipient": {
//       "name": "John Smith",
//       "address1": "19749 Dearborn St",
//       "address2": "string",
//       "city": "Chatsworth",
//       "state_code": "CA",
//       "state_name": "California",
//       "country_code": "US",
//       "country_name": "United States",
//       "zip": "91311",
//       "phone": "string",
//       "email": "string",
//     },
//     "items": [
//       {
//         "id": 1,
//         "external_id": "item-1",
//         "variant_id": 1,
//         "sync_variant_id": 1,
//         "external_variant_id": "variant-1",
//         "warehouse_product_variant_id": 1,
//         "product_template_id": 1,
//         "external_product_id": "template-123",
//         "quantity": 1,
//         "price": "13.00",
//         "retail_price": "13.00",
//         "name": "Enhanced Matte Paper Poster 18×24",
//         "product": {
//           "variant_id": 3001,
//           "product_id": 301,
//           "image": "https://files.cdn.printful.com/products/71/5309_1581412541.jpg",
//           "name": "Bella + Canvas 3001 Unisex Short Sleeve Jersey T-Shirt with Tear Away Label (White / 4XL)"
//         },
//         "files": [
//           {
//             "type": "default",
//             "url": "​https://www.example.com/files/tshirts/example.png",
//             "options": [
//               {
//                 "id": "template_type",
//                 "value": "native"
//               }
//             ],
//             "filename": "shirt1.png",
//             "visible": true,
//             "position": {
//               "area_width": 1800,
//               "area_height": 2400,
//               "width": 1800,
//               "height": 1800,
//               "top": 300,
//               "left": 0,
//               "limit_to_print_area": true
//             }
//           }
//         ],
//         "options": [
//           {
//             "id": "OptionKey",
//             "value": "OptionValue"
//           }
//         ],
//         "sku": null,
//         "discontinued": true,
//         "out_of_stock": true
//       }
//     ],
//     "retail_costs": {
//       "currency": "USD",
//       "subtotal": "10.00",
//       "shipping": "5.00",
//     },
//     "gift": {
//       "subject": "Thjo John",
//       "message": "Have a nice day"
//     },
//     "packing_slip": {
//       "email": "your-name@your-domain.com",
//       "message": "Message on packing slip",
//       "logo_url": "​http://www.your-domain.com/packing-logo.png",
//       "store_name": "Your store name"
//     }
//   }