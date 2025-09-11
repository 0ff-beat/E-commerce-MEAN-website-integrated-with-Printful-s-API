//creating server
const express = require("express");
const app = express();
const server = require("http").createServer(app);
//using packages
const cors = require("cors");
app.use(cors());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//connecting mongodb
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/midnight");
const mongodb = mongoose.connection;
mongodb.on("error", (err) => {
    console.log("mongoose error!!!");
})
mongodb.once("open", () => {
    console.log("mongodb is connected");
})
//require modules
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Keys
const printful_apiKey = fs.readFileSync("./keys/printful_apiKey.key", "utf8");
const jwt_privateKey = fs.readFileSync("./keys/jwt_privateKey.key", "utf8");
//twilio details
const twilio_accountSid = fs.readFileSync("./keys/twilio_SID.key","utf8");
const twilio_authToken = fs.readFileSync("./keys/twilio_Token.key","utf8");
const twilioNumber = "+12565784978";
const twilio = require("twilio") (twilio_accountSid,twilio_authToken);
//paypal details
const paypal_CLIENT_ID = fs.readFileSync("./keys/paypal_clientID.key","utf8");
const paypal_SECRET_ID = fs.readFileSync("./keys/paypal_secretID.key","utf8");
const paypalBaseURL = "https://api-m.sandbox.paypal.com/";
//creating mongo models
var { user_model, comment_model, cart_model, product_model, lower_custom_categories_model,catalog_product_model,search_query_model ,medium_custom_categories_model,high_custom_categories_model,orders_model} = require("./mongoModels")(mongoose);
//end points
//------------authentication
require("./routes/auth_routes")(app, jwt, bcrypt, jwt_privateKey, user_model, cart_model);
//------------OTP send
require("./routes/otpsend_route")(app);
//------------jwt token check
require("./routes/checktoken_route")(app, jwt, jwt_privateKey, user_model);
//-----------add product (temporary)
require("./routes/addproducts_route")(app, printful_apiKey, product_model);
//-----------add custom categories (temporary)
require("./routes/addCustomCategory_route")(app, lower_custom_categories_model,medium_custom_categories_model,high_custom_categories_model);
//----------- add catalog data to database (temporary)
require("./routes/setting_catalog_data_route")(app,printful_apiKey,catalog_product_model);
//-----------getting all products data (changable)
require("./routes/getProducts_byCategories")(app,product_model,catalog_product_model,printful_apiKey,lower_custom_categories_model,medium_custom_categories_model,high_custom_categories_model);
//-----------get specific product
require("./routes/getsingleproduct_route")(app,product_model,catalog_product_model);
//-----------get account information
require("./routes/getAccountInfo_route")(app,jwt_privateKey,user_model);
//----------send countries information
require("./routes/sendAllCountries_route")(app,printful_apiKey);
//----------send otp via phone number
require("./routes/sendOtpViaPhoneNumber_route")(app,twilioNumber,twilio);
//----------account verify
require('./routes/accountVerify_route')(app,user_model,jwt_privateKey);
//----------checking user account verification
require("./routes/checkAccountVerified_route")(app,jwt_privateKey,user_model);
//----------sending user personal details
require("./routes/sendingPersonalDetails_route")(app,user_model,jwt_privateKey);
//----------sending comments to front end
require("./routes/comments_route")(app,comment_model,jwt_privateKey,user_model,product_model);
//----------sending shipping rates to front end
require("./routes/getShippingRates_route")(app,printful_apiKey,user_model,jwt_privateKey,product_model);
//----------cart CURD operations
require('./routes/addToCart_route')(app,cart_model,jwt_privateKey,user_model,product_model);
//----------search routes
require('./routes/search_route')(app,product_model,search_query_model,catalog_product_model);
//----------getting 5 products for home page
require('./routes/get5products_route')(app,product_model,catalog_product_model);
//----------delete account
require("./routes/deleteAccount_route")(app,user_model,jwt_privateKey);
//----------order routes (changable)
require("./routes/orders_route")(app,jwt_privateKey,user_model,orders_model,printful_apiKey,product_model,cart_model);
//----------paypal routes
// require('./routes/paymentGateway_route')(app,paypal_CLIENT_ID,paypal_SECRET_ID,paypalBaseURL);
//listening to server at port 80
server.listen(80, "192.168.29.199", () => {
    console.log("server is running");
})
// server.listen(80, () => {
//     console.log("server is running");
// })