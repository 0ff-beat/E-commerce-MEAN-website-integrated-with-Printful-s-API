const axios = require("axios");
const circularJSON = require("circular-json");
const sendAllCountries = (app,printful_apiKey)=>{
    app.get("/allcountries",async (req,res)=>{
        try{
            //getting all countries infromation from printful;
            const response = await axios({
                method:"get",
                headers:`Authorization:Bearer ${printful_apiKey}`,
                url:"https://api.printful.com/countries"
            });
            // convert data into json data
            var responseJSON= JSON.parse(circularJSON.stringify(response));
            //send data to front end
            var realData = responseJSON["data"]["result"];
            res.json({"status":200,"data":realData});
        }catch(error){
            // error possibilities
            //first error -- on getting data with axios
            //second error -- on sending data to front end
            console.log("error is ",error);
            res.json({"status":404,"message":"unexpected error occur"});
        }

    })
}
module.exports = sendAllCountries;