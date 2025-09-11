const circularJson = require("circular-json");
const axios = require("axios");
const addproducts = (app,printful_apiKey,product_model) => {
    app.post("/addproducts", async (req, res) => {
        //getting details from user
        var product_id = await req.body.productID;
        var mockUpImages = await req.body.mockUpImages; //[{},{}]
        // product_id
        //mock_up_images
        // -->color: ?
        // -->colorCode: ?
        // -->front: ?
        // -->back: ?
        // -->left: ?
        // -->right: ?
        try {
            //getting data from printful
            var responseData_cirJSON = await axios({
                method: "get",
                url: `https://api.printful.com/store/products/${product_id}`,
                headers: { "Authorization": `Bearer ${printful_apiKey}` }
            });
            //converting data to real json format
            var responseData = JSON.parse(circularJson.stringify(responseData_cirJSON));
            //saving data to mongodb
            var finalModel = await new product_model({
                id: responseData["data"]["result"]["sync_product"]["id"],
                external_id: responseData["data"]["result"]["sync_product"]["external_id"],
                name: responseData["data"]["result"]["sync_product"]["name"],
                variants: responseData["data"]["result"]["sync_product"]["variants"],
                synced: responseData["data"]["result"]["sync_product"]["synced"],
                thumbnail_url: responseData["data"]["result"]["sync_product"]["thumbnail_url"],
                is_ignored: responseData["data"]["result"]["sync_product"]["is_ignored"],
                mock_up_images:mockUpImages,
                sync_variants: responseData["data"]["result"]["sync_variants"]
            });
            await finalModel.save();
            // res.send("Product is saved in mongodb");
            res.json({status:200})
        } catch (error) {
            //errors possibilities
            //first error -- from axios
            //second error -- mongoose model not save
            // res.send("Due to error --- product is not saved in mongodb");
            res.json({status:404})
            console.log(error)
        }
    })
}
module.exports = addproducts;