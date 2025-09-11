const get5products_route= (app,product_model,catalog_product_model)=>{
    app.get("/get5products",async (req,res)=>{
        try{
            var allProducts = await product_model.find({});
            var requiredProducts = [];
            for(var i=0;i<5;i++){
                var catalogProduct = await catalog_product_model.find({"id":await allProducts[i]["sync_variants"][0]["product"]["product_id"]});
                await requiredProducts.push({'catalogProduct':catalogProduct[0],'syncProduct':await allProducts[i]});
            }
            res.json({status:200,data:requiredProducts});
        }catch(error){
            console.log(error)
            res.json({status:404})
        }
    })
}
module.exports = get5products_route;