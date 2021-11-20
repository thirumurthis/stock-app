const express = require('express')
const path = require("path");
const app = express()
const port = process.env.PORT || 5000
var compression = require('compression')
app.use(compression())
const request = require('request')
const bodyParser = require("body-parser");
app.use(express.urlencoded({extended: true }))
app.use(bodyParser.urlencoded({ extended: false }));
  //use express template 
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname, "public")));

const router = express.Router();
app.use('/', router);
router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

const baseUrl = 'https://my-stock-boot-app.herokuapp.com';
const ALREADY_REGISTERED_STR = "already a registered";

// Working version still requires additional scenarios to handle
app.post('/submit', (req,res)=> {
  const username = req.body.username
  const password = req.body.password;
  const content = {"userName": username, "password": password};
  let apiKeyVal  = null;
  let tokenVal = null;
  console.log("Form submitted")
  if(username == null || username == '' || username == undefined 
  || password == null || password == undefined || password == ''){
    res.render("response",{statusMessage:"not found", apiKey : null});
    return;
  }
  //1. start with the user to sign up
  request({
    url: baseUrl +'/stock-app/signup', //URL to hit
    method: 'POST', // specify the request type
    headers: {'Content-Type': 'application/json'}, // speciyfy the headers
    json: true,
    body: content //Set the body as a stringify
  }, function(error, response, body){
    if(error) {
        console.log(error);
        res.render("response",{statusMessage : "Failed to signup.",apiKey : null})
    } else {
        // If the signup is successfull, check new user or existing user
        response.setEncoding('utf-8');
        //console.log(response.statusCode, body);
        if(response.statusCode == 200 ){
          apiKeyVal = body.apiKey;
          let statusFromSignup = body.statusMessage;
          //if new user the apikey token will be generated immediately
          if(apiKeyVal != null  && apiKeyVal != undefined && apiKeyVal != ''){
            let tokContent = {"userName": username, "apiKey" : apiKeyVal};
            request({
              url: baseUrl +'/stock-app/token', //URL to hit
              method: 'POST', // specify the request type
              headers: {'Content-Type': 'application/json'}, 
              json: true,
              body: tokContent //Set the body as a stringify
            }, function(error, response, body){
              if(error) {
                  console.log(error);
                  res.render("response",{statusMessage : "Failed to get token",apiKey : null})
              } else {
                  response.setEncoding('utf-8')
                  console.log(response.statusCode, body);
                  if(response.statusCode == 200 ){
                    //console.log(body);
                    //tokenVal = body.jwtToken;
                    res.render("response",{statusMessage : "User Registered, functionality not yet implemented",apiKey : null})
                    //console.log(tokenVal);
                  }else
                      res.render("response",{statusMessage : "Failed to get token",apiKey : null})
                  }
            });
          }else{
            // check if the user account is already registered
            if (statusFromSignup != null && statusFromSignup != '' && statusFromSignup.includes(ALREADY_REGISTERED_STR)){
              request({
                url: baseUrl +'/stock-app/apikey', //URL to hit
                method: 'POST', // specify the request type
                headers: {'Content-Type': 'application/json'}, // speciyfy the headers
                json: true,
                body: content //Set the body as a stringify
              }, function(error, response, body){
                if(error) {
                    console.log(error);
                    res.render("response",{statusMessage : "Token Access failed!!",apiKey : null})
                } else {
                    response.setEncoding('utf-8')
                    //console.log(response.statusCode, body);
                    if(response.statusCode == 200 ){
                      //console.log("url: /apikey = "+body);
                      tokenVal = body.jwtToken;
                      //console.log(tokenVal);
                      //with the token value fetch the stock info from backend
                      if(tokenVal != null && tokenVal != undefined){
                        let tokContent = {"userName": username, "apiKey" : apiKeyVal};
                        request({
                          url: baseUrl +'/stock/v1/stock-info',
                          method: 'POST', // specify the request type
                          headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': "Bearer "+tokenVal
                                }, 
                          json: false,
                          body: null //Set the body as a stringify
                        }, function(error, response, body){
                          if(error) {
                              console.log(error);
                              res.render("response",{statusMessage : "Stock Access failed!!",apiKey : null})
                          } else {
                              response.setEncoding('utf-8')
                              //console.log(response.statusCode, body);
                              if(response.statusCode == 200 ){
                                //console.log(body);
                                //console.log("json list : - "+body.stockInfo);
                                if(body != null ){
                                 res.render("stocklist",JSON.parse(body));
                                }else{
                                  res.render("stockList",{});
                                }
                              }else
                                  res.render("response",{statusMessage : "Stock Access failed!!",apiKey : null})
                              }
                        });
                      }
                    }else
                        res.render("response",{statusMessage : "Token Access failed!!",apiKey : null})
                    }
              });
            }else {
               res.render("response",{statusMessage : "Token Access failed!!",apiKey : null})
            }
          }
        }else{
          res.render("response",{statusMessage : "Access failed!!",apiKey : null})
        }
    }
});
});
app.listen(port, () => console.log(`App Started and listening on port ${port}!`))