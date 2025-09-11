const axios = require("axios");
const CircularJSON = require("circular-json");
const setting_catalog_data_route = (app, printful_apiKey,catalog_product_model) => {
    app.get("/setCatalogData", async (req, res) => {
        try {
            //getting Catalog Products Data from axios
            var response = await axios({
                method: 'get',
                url: `https://api.printful.com/products`,
                headers: {
                    'Authorization': `Bearer ${printful_apiKey}`,
                }
            });
            //converting data to JSON data (all products in list)
            var JSONRes= await JSON.parse(CircularJSON.stringify(response));
            for (var i = 2; i < 7; i++) {
                //getting single catalog product from catalog products
                var catalogProduct = await JSONRes["data"]["result"][i];
                //getting variants of that product
                 var variantData = await axios({
                    method: 'get',
                    url: `https://api.printful.com/products/${catalogProduct["id"]}`,
                    headers: {
                        'Authorization': `Bearer ${printful_apiKey}`,
                    }
                });
                //converting variantData to json VariantData
                var variantData_JSON = await JSON.parse(CircularJSON.stringify(variantData));
                var variants = await variantData_JSON["data"]["result"]["variants"]; 
                //creating mongoDB Document
                var mainModels = new catalog_product_model({
                    id: catalogProduct["id"],
                    main_category_id: catalogProduct["main_category_id"],
                    type: catalogProduct["type"],
                    description: catalogProduct["description"],
                    type_name: catalogProduct["type_name"],
                    title: catalogProduct["title"],
                    brand: catalogProduct["brand"],
                    model: catalogProduct["model"],
                    image: catalogProduct["image"],
                    variant_count: catalogProduct["variant_count"],
                    currency: catalogProduct["currency"],
                    is_discontinued: catalogProduct["is_discontinued"],
                    avg_fulfillment_time: catalogProduct["avg_fulfillment_time"],
                    origin_country: catalogProduct["origin_country"],
                    catalog_variants:variants
                });
                //saving document
                 await mainModels.save();
                }
                res.json({"status":200,"message":"catalog products are SAVED in Database."})
        } catch (er) {
            //error possibilities
            //first error -- from axios
            //second error -- mongoose model not saved 
            res.json({"error":er})
         }
    })
}
module.exports = setting_catalog_data_route;