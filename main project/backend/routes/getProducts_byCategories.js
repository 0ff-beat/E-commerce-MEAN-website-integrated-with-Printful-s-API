const axios = require("axios");
const CircularJSON = require("circular-json");
const getProducts_route = (app, product_model, catalog_product_model, printful_apiKey,lower_custom_categories_model,medium_custom_categories_model,high_custom_categories_model) => {
    //for low categories
    app.post("/getProductsByCategories", async (req, res) => {
        //there are three type of categories
        // 1. super category (super)
        // 2. medium category (medium)
        // 3. low category (low)
        //explaination:
        //3. if category type is low,then category name is required.
        //   if category name is not given then all the names are sent. 
        //getting required type of category & name of category
        var categoryType = await req.body.type;
        var categoryName = await req.body.name; 
        if(categoryType == "low"){
            if(categoryName != ""){
                //actual products are sent to front end on the bases of categoryName
                var data = await lowCategoryType(categoryName);
                res.json({status:200,data:data});
            }else{
                var allNames = await lowCategoryType_withoutName();
                // all the lower category names are sent to front end
                res.json({status:200,data:allNames});
            }
        }
       
    });
    async function lowCategoryType_withoutName(){
        //getting all lower categories from database
        var data = await lower_custom_categories_model.find({});
        //extracting names from data
        var allNames = await data.map((obj)=>{
            return obj["name"];
        });
        return allNames;
    }
    async function lowCategoryType(categoryName){
        //getting sync ID's of required products
        var category = await lower_custom_categories_model.find({name:categoryName});
        var productIDs = await category[0]["product_ids"];
        //getting sync product document
       var syncProducts =  [];
        for(var i=0;i<productIDs.length;i++){
            var single_syncProduct= await product_model.find({id:productIDs[i]});
            syncProducts.push(single_syncProduct[0])
        }
        //getting catalog ID's of required products
        var catalogIds = await syncProducts.map((obj)=>{
            return obj["sync_variants"][0]["product"]["product_id"];
        });
        //getting catalog product document
        var catalogProducts = [];
        for(var j=0;j< catalogIds.length;j++){
            var single_catalogProduct  = await catalog_product_model.find({id:catalogIds[j]});
            if(single_catalogProduct.length == 0){
                //formating object
                single_catalogProduct = await madeCatalogProduct(catalogIds[j]);
                single_catalogProduct["product"].catalog_variants = await single_catalogProduct["variants"]
                //storing object
                catalogProducts.push(single_catalogProduct["product"]);
            }else{
                catalogProducts.push(await single_catalogProduct[0]);
            };
        }
        return {"syncProducts":syncProducts,"catalogProducts":catalogProducts};
    }
    // for fetching catalog products from printful 
    async function madeCatalogProduct(id){
        var singleCatalogProduct_Cir = await axios({
                        method: 'get',
                        url: `https://api.printful.com/products/${id}`,
                        headers: {
                            'Authorization': `Bearer ${printful_apiKey}`,
                        }
                    });
    var singleCatalogProduct = await JSON.parse(CircularJSON.stringify(singleCatalogProduct_Cir));
    var product = await singleCatalogProduct["data"]["result"];   
    //saving to database
    var finalProduct = await new catalog_product_model({
                    id: product["product"]["id"],
                    main_category_id: product["product"]["main_category_id"],
                    type: product["product"]["type"],
                    description: product["product"]["description"],
                    type_name: product["product"]["type_name"],
                    title: product["product"]["title"],
                    brand: product["product"]["brand"],
                    model: product["product"]["model"],
                    image: product["product"]["image"],
                    variant_count: product["product"]["variant_count"],
                    currency: product["product"]["currency"],
                    is_discontinued: product["product"]["is_discontinued"],
                    avg_fulfillment_time: product["product"]["avg_fulfillment_time"],
                    origin_country: product["product"]["origin_country"],
                    catalog_variants: product["variants"]
                })
                await finalProduct.save()
    return product;             
}
app.get("/getCategoriesName",async (req,res)=>{
try{
    //getting all categories name
    var allLowerCategoriesDocument =await lower_custom_categories_model.find({});
    var allMediumCategoriesDocument =await medium_custom_categories_model.find({});
    var allHighCategoriesDocument = await high_custom_categories_model.find({});
    var data = await [];
    for(const highdocument of allHighCategoriesDocument){
        var allLowerDocument_inHigh =await [];
        var allMediumDocument_inHigh =await [];
        for(var i=0;i<highdocument['mediumCategoryNames'].length;i++){
            var mediumCategorieName =await highdocument['mediumCategoryNames'][i];
            var mediumCategoryDocument= await allMediumCategoriesDocument.filter((obj)=>{
                if(obj["name"] == mediumCategorieName){return true;}else{return false;}
            });
            mediumCategoryDocument = mediumCategoryDocument[0];
            await allMediumDocument_inHigh.push(await mediumCategoryDocument);
            for(var j=0;j<mediumCategoryDocument["lowerCategoryNames"].length;j++){
                var lowerCategoryName= await mediumCategoryDocument["lowerCategoryNames"][j];
               var lowerCategoryDocument=  await allLowerCategoriesDocument.filter((obj)=>{
                    if(obj["name"] == lowerCategoryName){return true;}else{return false;}
                });
                await allLowerDocument_inHigh.push(await lowerCategoryDocument[0]);
            }
        };
        await data.push({
            highName:highdocument["name"],
            mediumDoc:allMediumDocument_inHigh,
            lowerDoc:allLowerDocument_inHigh
        });

    };
    //sending response to front end
    res.json({status:200,data:data});
}catch(error){console.log(error);res.json({status:404})}
});
}
module.exports = getProducts_route;