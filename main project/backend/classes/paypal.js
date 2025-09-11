const axios = require("axios");
const circularJSON = require("circular-json");
module.exports =  class paypal{
    clientID;
    secretID;
    baseURL;
    constructor(clientID,secretID,baseURL){
        this.clientID = clientID;
        this.secretID = secretID;
        this.baseURL = baseURL;
        console.log("ok1")
    }
    async generateAccessToken(){
        console.log("ok2")
        try{
            if(this.clientID == undefined || this.secretID == undefined){return null}else{
                //hitting axios request
                var cir_response = await axios({
                    method:"post",
                    url:`${this.baseURL}v1/oauth2/token`,
                    data:{"grant_type":"client_credentials"},
                    headers:{
                        'Accept': 'application/json', 
                        'Accept-Language': 'en_US',
                        'Content-Type':'application/x-www-form-urlencoded',
                        'Access-Control-Allow-Origin': '*'
                    } ,
                    auth: {
                        username: this.clientID,
                        password: this.secretID
                      }
                });
                var response = await JSON.parse(circularJSON.stringify(cir_response));
                return response.data.access_token; 
            }
        }catch(error){console.log("an error occur on getting access token",error);return null}
    }
    async createOrder(value){
        try{
            //getting access token
            const accessToken = await this.generateAccessToken();
            console.log("ok3")
            // console.log(accessToken);
            if(accessToken == null){return null}else{
                //creating transection amount
                const payload = {
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: "USD",
                                value: value,
                            },
                        },
                    ],
                };
                //hitting required endpoint
                var cir_res = await axios({
                    method:"post",
                    url:`${this.baseURL}v2/checkout/orders`,
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:`Bearer ${accessToken}`
                    },
                    data:JSON.stringify(payload)
                });
                var res = await JSON.parse(circularJSON.stringify(cir_res));
                return res;

            }
        }catch(error){console.log(error);return null}
    }
    async captureOrder(OrderID){
        try{
            const accessToken =await this.generateAccessToken();
            console.log(accessToken);
            const url =await `${this.baseURL}v2/checkout/orders/${OrderID}/capture`;    
            if(accessToken != null){
                var captureResponse_cir = await axios({
                    url:url,
                    method:"post",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`}
                });
                var captureResponse =await JSON.parse(circularJSON.stringify(captureResponse_cir));
                return captureResponse;
            }else{return null;}
        }catch(error){
            // console.log(error)
            return null;
        }
    }
}