mongoModels = (mongoose) => {
    //creating mongoose user information schema
    var user = new mongoose.Schema({
        //primary informaton
        email: { type: String },
        password: { type: String },
        //order require information
        full_name: { type: String, default: null },
        address: { type: String, default: null },
        opt_address: { type: String, default: null },
        country: { type: String, default: null },
        state: { type: String, default: null },
        city: { type: String, default: null },
        zip: { type: String, default: null },
        phone_number: { type: String, default: null },
        //additional feature informatioin
        cart_id: { type: String }
    });
    var user_model = new mongoose.model("user", user);
    //creating mongoose user comments schema
    var comment = new mongoose.Schema({
        //details useful for user
        date:{type:String},
        helpful:{type:mongoose.Schema.Types.Array},
        report:{type:mongoose.Schema.Types.Array},
        rating:{type:String},
        //primary details
        fullname:{type:String},
        owner_id:{type:String},
        product_id:{type:String},
        comment: { type: String }
    });
    var comment_model = new mongoose.model("comment", comment);
    //creating mongoose user cart schema
    var cart = new mongoose.Schema({
        product_ids: { type: mongoose.Schema.Types.Array }
    });
    var cart_model = new mongoose.model("cart", cart);
    //creating mongoose products schema
    const product = new mongoose.Schema({
        id: { type: String },
        external_id: { type: String },
        name: { type: String },
        variants: { type: Number },
        synced: { type: Number },
        thumbnail_url: { type: String },
        is_ignored: { type: String },
        //custom keys
        sold: { type: String, default: "0" },
        rating: { type: String, default: "2.5" },
        mock_up_images: [
            {
                colorCode: { type: String },
                color: { type: String },
                front: { type: String, default: "" },
                back: { type: String, default: "" },
                right: { type: String, default: "" },
                left: { type: String, default: "" }
            }
        ],
        //variants
        sync_variants: { type: mongoose.Schema.Types.Array }
    });
    //creating products model
    const product_model = new mongoose.model("product", product);
    //creating lower custom category schema
    const lower_custom_category = new mongoose.Schema({
        name: { type: String },
        product_ids: []
    });
    //creating lower custom category model
    const lower_custom_categories_model = new mongoose.model("lower_custom_categorie", lower_custom_category)
    //creating medium custom category schema
    const medium_custom_category = new mongoose.Schema({
        name:{type:String},
        lowerCategoryNames:[]
    });
    //creating medium custom category model
    const medium_custom_categories_model = new mongoose.model("medium_custom_categorie",medium_custom_category);
    //creating high custom category schema
    const high_custom_category = new mongoose.Schema({
        name:{type:String},
        mediumCategoryNames:[]
    });
    //creating high custom category model
    const high_custom_categories_model = new mongoose.model("high_custom_categorie",high_custom_category);
    //creating catalog products schema
    const catalog_product = new mongoose.Schema({
        id:{type:String},
        main_category_id: {type:String},
        type: {type:String},
        description: {type:String},
        type_name:{type:String},
        title: {type:String},
        brand: {type:String},
        model: {type:String},
        image: {type:String},
        variant_count:{type:String},
        currency:{type:String},
        is_discontinued: {type:String},
        avg_fulfillment_time: {type:String},
        origin_country: {type:String},
        catalog_variants: { type: mongoose.Schema.Types.Array }

    });
    
    //creating catalog products model
    const catalog_product_model = new mongoose.model("catalog_product",catalog_product);
    //creating search query schema
    const search_query_schema = new mongoose.Schema({
        query:{type:String}
    });
    const search_query_model = new mongoose.model("search_querie",search_query_schema);
    //creating orders schema
    const orders = new mongoose.Schema({
        ownerID:{type:String},
        order:[] //single user's all order
    })
    const orders_model = new mongoose.model("order",orders);
    return { user_model, comment_model, cart_model, product_model, lower_custom_categories_model ,catalog_product_model,search_query_model,medium_custom_categories_model,high_custom_categories_model,orders_model}
}
module.exports = mongoModels;