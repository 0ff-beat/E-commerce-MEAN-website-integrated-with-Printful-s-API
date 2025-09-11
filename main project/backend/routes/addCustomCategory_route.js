const addCustomCategory = (app,custom_categories_model,medium_custom_categories_model,high_custom_categories_model)=>{
    app.post("/addLowerCategory",async (req,res)=>{
        //getting product id's from user
        var product_ids = await req.body.ids;
        var category_name = await req.body.name;
        product_ids = await product_ids.map((obj)=>{
            return obj["id"];
        })
        try{
            //creating mongo document
            var model = await new custom_categories_model({
                name:category_name,
                product_ids:product_ids
            });
            //saving document
            await model.save();
            //sending response
            res.json({status:200,message:"category document saved"})
        }catch(err){
            //error possibilities
            //first error -- mongo model not saved
            res.json({status:404,message:"category document not saved -- due a an error"})
            console.log(err)
        }
    });
    app.post("/updateLowerCategory",async (req,res)=>{
        try{
            //getting req data
            var categoryName = await req.body.name;
            var syncProductID = await req.body.id;
            //updating lower custom category  
            await custom_categories_model.updateOne({name:categoryName},{$push:{product_ids:syncProductID}});
            res.json({status:200})
        }catch(error){
            console.log(error)
            res.json({status:404});
        }
    });
    app.post("/addMediumCategory",async (req,res)=>{
        try{
            //getting medium category name and all lower category names that should be included in medium category
            var mediumName=await req.body.name;
            var lowerNamesList =await req.body.lowerNameList;
            var newLowerNamesList = await lowerNamesList.map((name)=>{
                return name["name"];
            })
            //creating medium category
            var result = await medium_custom_categories_model({
                name:mediumName,
                lowerCategoryNames:newLowerNamesList
            });
            //saving category document in database
            result.save();
            //sending response to front end
            res.json({status:200});
        }catch(error){console.log(error);res.json({status:404})}
    });
    app.post("/updateMediumCategory",async (req,res)=>{
        try{
            //getting medium category name
            var mediumName = await req.body.name;
            var lowerCategoryName =await req.body.lowerName; // it must be string
            console.log(mediumName)
            console.log(lowerCategoryName);
            await medium_custom_categories_model.updateOne({name:mediumName},{$push:{lowerCategoryNames:lowerCategoryName}});
        //sending response to front end
        res.json({status:200});
        }catch(error){console.log(error);res.json({status:404})}

    });
    app.post("/addHighCategory",async (req,res)=>{
        try{
            var highName=await req.body.name;
            var mediumNamesList =await req.body.mediumNameList;
            var newMediumNamesList = await mediumNamesList.map((name)=>{
                return name["name"];
            })
            //creating medium category
            var result = await high_custom_categories_model({
                name:highName,
                mediumCategoryNames:newMediumNamesList
            });
            //saving category document in database
            result.save();
            //sending response to front end
            res.json({status:200});
        }catch(error){console.log(error);res.json({status:404})}
    });
    app.post("/updateHighCategory",async (req,res)=>{
        try{
            var highName = await req.body.name;
            var mediumCategoryName =await req.body.mediumName; // it must be string
            // console.log(mediumName)
            // console.log(lowerCategoryName);
            await high_custom_categories_model.updateOne({name:highName},{$push:{mediumCategoryNames:mediumCategoryName}});
        //sending response to front end
        res.json({status:200});
        }catch(error){console.log(error);res.json({status:404})}

    });

}
module.exports = addCustomCategory;


// total 6 products
//mens clothing
// 1 -- jacket
// 3 -- hoodie
// 2 -- t-shirts