const axios = require("axios");
const jwt = require("jsonwebtoken");
const circularJSON = require("circular-json");
const getShippingRates = (app, printful_apiKey, user_model, jwt_privateKey,product_model) => {
    app.post("/getShippingRates", async (req, res) => {
        try {
            //getting required information from user
            var token = await req.body.token;
            //getting required variables that is important to make items
            var syncProductID = await req.body.syncProductID;
            var syncVaraintID = await req.body.syncVariantID;
            var retailPrice = await req.body.retailPrice;
            var quantity = await req.body.quantity;
            // console.log(syncProductID,syncVaraintID,retailPrice,quantity);
            //getting catalog variantID
            var items = []; 
            for(var i=0;i<syncProductID.length;i++){
                var syncProductDocument = await product_model.find({id:syncProductID[i]});
            if(syncProductDocument.length != 0){
                //when product exists
                var syncVariantDocument = await syncProductDocument[0]["sync_variants"].filter((variantObj)=>{
                    if(variantObj["id"] == syncVaraintID[i]){
                    return true;
                    }else{return false;}
                });
                await items.push({"variant_id":syncVariantDocument[0]["product"]["variant_id"],"quantity":quantity[i],"value":retailPrice[i]});
            }
        }
            //extract data from token
            var tokenData = await jwt.verify(token, jwt_privateKey);
            var userDocument = await user_model.find({ $and: [{ email: tokenData["email"] }, { password: tokenData["password"] }] });
            if (userDocument.length == 0) {
                //when user not exist in database;
                res.json({ status: 404 });
            } else {
                //when user exists in database;
                //getting all countries
                var axiosResponse_getCountryCode_Cir = await axios({
                    method:"get",
                    url:"https://api.printful.com/countries",
                    headers:`Authorization: Bearer ${printful_apiKey}` 
                });
                //extracting required country from all countries
                var axiosRes_getCountryCode = await JSON.parse(circularJSON.stringify(axiosResponse_getCountryCode_Cir))
               var countryObj= await axiosRes_getCountryCode["data"]["result"].filter((obj)=>{
                    if(obj["name"].toLowerCase() ==userDocument[0]["country"].toLowerCase() ){
                        return true;
                    }else{
                        return false;
                    }
                });
                if(countryObj.length == 0){
                    //invalied country
                    res.json({status:404})
                }else{
                    if(countryObj['states'] == null){
                        //when states are null
                        //creating body of shipping request
                    var printfulRequest_body = {
                        "recipient": {
                          "address1": userDocument[0]["address"],
                          "city": userDocument[0]["city"],
                          "country_code": countryObj[0]["code"],
                          "zip": userDocument[0]["zip"],
                          "phone": userDocument[0]["phone_number"]
                        },
                        "items": items,
                        "currency": "USD"
                }
                var circularResponse= await axios({
                    method:"post",
                    url:"https://api.printful.com/shipping/rates",
                    data:printfulRequest_body,
                    headers:`Authorization: Bearer ${printful_apiKey}` 
                });
                var actualResponse = await JSON.parse(circularJSON.stringify(circularResponse));
                res.json({status:200,data:{standard:actualResponse["data"]["result"][0],standard_carbon_offset:actualResponse["data"]["result"][1],printful_fast:actualResponse["data"]["result"][2]}});
            }else{
                //when states are not null
                //extracting required state object from all states
                var stateObject = await countryObj['states'].filter((stateObj)=>{
                    if(stateObj["name"].toLowerCase() == userDocument[0]["state"].toLowerCase()){
                        return true;
                    }else{
                        return false;
                    }
                })
                //creating body of shipping request
                var printfulRequest_body = {
                    "recipient": {
                        "address1": userDocument[0]["address"],
                        "city": userDocument[0]["city"],
                        "country_code": countryObj[0]["code"],
                        "state_code": stateObject[0]["code"],
                        "zip": userDocument[0]["zip"],
                        "phone": userDocument[0]["phone_number"]
                    },
                    "items": items,
                    "currency": "USD"
                }
                var circularResponse= await axios({
                    method:"post",
                    url:"https://api.printful.com/shipping/rates",
                    body:printfulRequest_body,
                    headers:`Autherization: bearer ${printful_apiKey}` 
                });
                var actualResponse = await JSON.parse(circularJSON.stringify(circularResponse));
                res.json({status:200,data:{standard:actualResponse["data"]["result"][0],standard_carbon_offset:actualResponse["data"]["result"][1],printful_fast:actualResponse["data"]["result"][2]}});
            }
        }
    }
} catch (error) { console.log(error); res.json({ status: 404 }) }


});
}
module.exports = getShippingRates;
// {
//     "recipient": {
//       "address1": "19749 Dearborn St",
//       "city": "Chatsworth",
//       "country_code": "US",
//       "state_code": "CA",
//       "zip": "91311",
//       "phone": "string"
//     },
//     "items": [
//       {
//         "variant_id": "71",
//         "external_variant_id": "1001",
//         "warehouse_product_variant_id": "2",
//         "quantity": 10,
//         "value": "2.99"
//       }
//     ],
//     "currency": "USD",
//     "locale": "en_US"
//   }