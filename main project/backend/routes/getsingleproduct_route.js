const axios= require("axios");
const CircularJSON = require("circular-json");
const getsingleproduct = (app,product_model,catalog_product_model)=>{
app.post("/specificProduct",async (req,res)=>{
    try{
        //getting require ids
        var productID = await req.body.productID;
        var catalogProductID = await req.body.catalogProductID;
        console.log(productID)
        console.log(catalogProductID)
        //getting req data
        var productDocument =await product_model.find({id:productID});
        var catalogDocument =await catalog_product_model.find({id:catalogProductID});
        if(productDocument.length == 0){
            res.json({status:404,message:"product not exists in database"});
        }else{
            if(catalogDocument.length == 0){
                //saving to database
                catalogDocument = await madeCatalogProduct(catalogProductID);
            }else{
                catalogDocument =await catalogDocument[0];
            }
            res.json({status:200,data:{"syncData":productDocument,"catalogData":catalogDocument}});
        }
    }catch(error){
        console.log(error)
        res.json({status:404,message:"unexpected error occur"})
    }
    });
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
} 
module.exports= getsingleproduct