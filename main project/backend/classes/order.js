const axios = require("axios");
const circularJSON = require("circular-json");
module.exports = class Orders {
    constructor() {
    }
    async getCountries(printfulKey) {//getting countries data from printful
        try {
            var circularResponse = await axios({
                method: "get",
                url: "https://api.printful.com/countries",
                headers: `Authorization: Bearer ${printfulKey}`
            });
            var data = await JSON.parse(circularJSON.stringify(circularResponse));
            return data["data"]["result"];
        } catch (error) { console.log(error); return null }
    }
    async findCodes(data, userCountry, userState) {//getting country code and state code
        var stateCode = null;
        var requiredCountry = await data.filter((country) => {
            if (country["name"].trim().toLowerCase() == userCountry.trim().toLowerCase()) {
                return true;
            } else {
                return false;
            }
        });
        var countryCode = await requiredCountry[0]["code"];
        if (requiredCountry[0]["states"] != null) {
            var requiredState = await requiredCountry[0]["states"].filter((state) => {
                if (state["name"].trim().toLowerCase() == userState.trim().toLowerCase()) {
                    return true;
                } else {
                    return false;
                }
            });
            stateCode = await requiredState[0]["code"];
        }
        return { stateCode: stateCode, countryCode: countryCode };
    }
    async getCodes(userCountry, userState, printfulKey) {
        //getting data
        var data = await this.getCountries(printfulKey);
        if (data != null) {
            //finding country,state codes
            var codes = await this.findCodes(data, userCountry, userState);
            return codes;
        } else {
            return null;
        }
    }
    async getItemsPurchase(data, product_model) {// data look like --> [{syncVariantID:435,syncProductID:43}];
        var items = await [];
        try {
            for (const dataObj of data) {
                var productDocument = await product_model.find({ id: dataObj["syncProductID"] });
                if (productDocument.length == 0) {
                    await items.push(null);
                } else {
                    var variantDocument = await productDocument[0]["sync_variants"].filter((variantDoc) => {
                        if (variantDoc["id"] == dataObj["syncVariantID"]) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    await items.push(variantDocument[0]);
                }
            }
            return items;
        } catch (error) { console.log(error); return null; }
    }
    async requestForOrder(shippingData,itemsData,countryStateCode,userDoc,userAddressData,printful_apiKey) {
    var purchaseData= await itemsData;
    for(var i=0;i<itemsData.length;i++){
        var files = await itemsData[i]["files"].filter((file)=>{
            if(file["hash"] == null){
                return false;
            }else{
                return true;
            }
        });
        purchaseData[i]["files"] = await files;
    }
        var bodyData = {
            "shipping": shippingData["shippingName"],
            "recipient": {
                "name": userDoc["full_name"],
                "address1": userAddressData["address1"],
                "address2": userAddressData["address2"],
                "city": userAddressData["city"],
                "state_code": countryStateCode["stateCode"],
                "state_name": userAddressData["state"],
                "country_code": countryStateCode["countryCode"],
                "country_name": userDoc["country"],
                "zip": userDoc["zip"],
                "phone": userDoc["phone_number"],
                "email": userDoc['email'],
            },
            "items": purchaseData,
            "retail_costs": {
                "currency": "USD",
                "subtotal": Number(shippingData["Total"])-Number(shippingData["shippingCost"]),
                "shipping": shippingData["shippingCost"],
            },
            "gift": {
                "subject": `Thanks ${userDoc["full_name"]} for choosing us.`,
                "message": "Have a nice day"
            },
            "packing_slip": {
                "email": "your-name@your-domain.com",
                "message": "shopping is cheaper than psychiatrist",
                "logo_url": "​http://www.your-domain.com/packing-logo.png",
                "store_name": "Grasper"
            }
        }
        bodyData = await JSON.stringify(bodyData);
        try{
            var responseCir = await axios({
                method: "post",
                params:{confirm:true},
                url: "https://api.printful.com/orders",
                data: bodyData,
                headers: {
                    "Authorization": `Bearer ${printful_apiKey}`
                }
            });
            var response = await JSON.parse(circularJSON.stringify(responseCir));
            return response["data"]["result"];
        }catch(error){
            console.log(error)
            return null;
        }
    }
    async saveOrderToMongoDB(orders_model, userID, resultOrderData,orderedProductImages) {//userID is the _id key of mongoDB Document
        //orderProductImages looks like --> ["img1.png","img2.png","img3.png"];
        try {
            var result = await orders_model({
                ownerID: userID,
                order: [{data:resultOrderData,images:orderedProductImages}]
            });
            result.save();
            return true
        } catch (error) { console.log(error); return false; }
    }
    async isUserFirstTimePurchase(order_model,userID){
        var document = await order_model.find({ownerID:userID});
        if(document.length == 0){
            return true;
        }else{return false;}
    }
    async addOrderToMongoDB(orders_model, userID, resultOrderData,orderedProductImages) {
        try {
            await orders_model.updateOne({ ownerID: userID }, { $push: { order: {images:orderedProductImages,data:resultOrderData} } });
            return true;
        } catch (error) { console.log(error); return false; }
    }
    async sendSuccessGmail(resultOrderData,userDoc){
        var text = await `Hi ${resultOrderData["recipient"]["name"]},\n You successfully Purchased ${resultOrderData["items"].length} Items of Total Cost ${resultOrderData["retail_costs"]["total"]} USD.\n\nThanks for choosing Us\n`;
        var subject = await `Successfully Purchased !!`;
        var response = await require("../functions/sendGMail")(userDoc["email"],subject,text);
        return response;
    }
    async getOrderedProductImages(itemsPurchaseData,product_model){ // itemsPurchaseData look like --> [{syncVariantID:435,syncProductID:43}];
       var images = [];
        for(var i=0;i<itemsPurchaseData.length;i++){
            var productDoc = await product_model.find({id:itemsPurchaseData[i]["syncProductID"]});
            if(productDoc[0]["mock_up_images"][0]["color"] == ""){
                //when product has single color
                await images.push(productDoc[0]["mock_up_images"][0]["front"]);
            }else{
                //when product has multiple colors
                for(var j=0;j<productDoc[0]["sync_variants"].length;j++){
                    if(productDoc[0]["sync_variants"][j]["id"] == itemsPurchaseData[i]["syncVariantID"]){
                        for(var k=0;k<productDoc[0]["mock_up_images"].length;k++){
                            if(productDoc[0]["mock_up_images"][k]["color"] == productDoc[0]["sync_variants"][j]["color"]){
                                //do something;
                                await images.push(productDoc[0]["mock_up_images"][k]["color"]["front"]);     
                                break;
                            }
                        }
                        break;
                    }
                 }
            }
        }
        return images;

    }
    async getOrders(userID,orders_model){
        var orderDocument = await orders_model.find({ownerID:userID});
        if(orderDocument.length == 0){
            return null;
        }else{
            return orderDocument[0];
        }
    }
    async emptyCart(cartID,cart_model){ //cartID is writting in userDocument["cart_id"];
        await cart_model.updateOne({_id:cartID},{$set:{product_ids:[]}})
    }
}
// orders.getCodes().then((response)=>{
//     console.log(response)
// })