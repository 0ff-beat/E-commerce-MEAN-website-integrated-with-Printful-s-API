const search_route = (app,product_model,search_query_model,catalog_product_model)=>{
app.post("/getSearchData",async (req,res)=>{
    try{
        //getting user query
        var query = await req.body.query;
        //filtering with mongoose
        var allProductDocuments = await require('../functions/searchAlgorithem')(query,product_model); // passing from a search algorithem
        if(allProductDocuments.length == 0 || allProductDocuments.length == undefined){
            var queryData=await getSearchNames();
            res.json({status:201,results:queryData}) 
        }else{
            var data = await getSearchData(allProductDocuments,query);
            //sending results to front end
            res.json({status:200,results:data});
        }
    }catch(error){console.log(error);res.json({status:404});}
});
async function getSearchData(allProductDocuments,query){
    var allcatalogProductDocuments = await [];
    for(const document of allProductDocuments){
        await allcatalogProductDocuments.push(await catalog_product_model.find({id:document["sync_variants"][0]["product"]["product_id"]}));
    };
    var data =await [];
    var i = 0;
    for(const document of allProductDocuments){
        var variantIDs = document["sync_variants"].map((obj)=>{
            return {"id":obj["id"],"currency":obj["currency"],"retail_price":obj["retail_price"]}
        }) 
        await data.push({
            catalogProductID:allcatalogProductDocuments[i][0]["id"],
            syncProductID:document["id"],
            syncVariantID:variantIDs,
            name:document["name"],
            description:allcatalogProductDocuments[i][0]["description"],
            image:document["mock_up_images"][0]["front"],
            rating:document["rating"],
            retail_price:document["retail_price"]
        });
        i += 1;
    };
    var allQueries = await search_query_model.find({});
    var isPreExistedQuery = false;
    for(const queryObj of allQueries){
        if(queryObj["query"].trim().toLowerCase() == query.trim().toLowerCase()){
            isPreExistedQuery = true;
            break;
        }
    }
    console.log(isPreExistedQuery);
    if(isPreExistedQuery){ //not saving to database
    }else{
        var result = await search_query_model({
            query:query.toLowerCase()
        });
        result.save();
    }
    return data;
}
async function getSearchNames(){
    var queriesDocuments = await search_query_model.find({});
    var requireQuries = [];
    if(queriesDocuments.length > 30){
        for(var i=0;i<30;i++){
            await requireQuries.push(await queriesDocuments[i]);
        }
    }else{
        requireQuries = await queriesDocuments;
    }
    return requireQuries;
}
app.post("/getSimilarQueries",async (req,res)=>{
    try{
        //getting user query
        var query = req.body.query;
        query = query.toLowerCase();
        //extracting similar queries
        var queriesData = await search_query_model.find({query:{$regex:query}});
        var requiredQueriesData = [];
        if(queriesData.length > 30){
            for(var i=0;i<30;i++){
                await requiredQueriesData.push(await queriesData[i]);
            }
        }else{
            requiredQueriesData = await queriesData;
        }
        res.json({status:200,data:requiredQueriesData});
    }catch(error){console.log(error);res.json({status:404});}
    });
}
module.exports = search_route;