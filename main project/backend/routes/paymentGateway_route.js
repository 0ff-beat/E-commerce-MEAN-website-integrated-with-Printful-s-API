const customPaypal = require("../classes/paypal");
const paymentGateway_route = (app,paypal_clientID,paypal_secretID,paypalBaseURL)=>{
    app.post("/createOrder",async (req,res)=>{
        try{
            var value = await req.body.value; //value is the payment magnitude by the user
            var paypalObj = new customPaypal(paypal_clientID,paypal_secretID,paypalBaseURL);
            await paypalObj.createOrder(value);
            res.json({"status":200});
        }catch(error){console.log(error);res.json({"status":404})}
    });
};
module.exports = paymentGateway_route;