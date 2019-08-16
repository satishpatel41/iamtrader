var Upstox = require("upstox");
var events = require('events');

var redirect_uri = "http://localhost:"+PORT+"/callback/";
if(process.env.NODE_ENV=="production")
{
    redirect_uri = "https://robo-trader.herokuapp.com/callback/";
}

class UpstoxBroker {  
    constructor(api,api_secret,isAutomated) {
        this.api = api;
        this.upstox = new Upstox(this.api);
        this.accessToken = "";
        this.api_secret = api_secret;
        this.client_id="";
        this.profile;
        this.balance;
        var that = this;
        
        if(!isAutomated){
            var loginUrl = this.upstox.getLoginUri(redirect_uri);
            console.log("loginUri ***" + loginUrl);
        }
        eventEmitter.on('placeOrder', onPlaceOrder);

       
        function onPlaceOrder(data){
            console.log('\nEvent -> onPlaceOrder ' + data.strategy.name +"::"+data.symbol);
            //that.upstox.setToken(that.accessToken);
            var orderObject = {
                transaction_type:data.strategy.isBuyOrSell,
                exchange:"NSE_EQ",
                symbol: data.symbol,
                quantity: 1,
                order_type:"m",
                product: "I"
            };

            if(that.accessToken){
                    that.upstox.placeOrder(orderObject)
                        .then(function(response) {
                            // Order details received
                            console.log(response);
                        })
                        .catch(function(err) {
                            // Something went wrong.
                            console.log(err);
                        });
                }
            }
    }

    getUpstoxAccessToken(c)
    {
       var params = {
            "apiSecret": this.api_secret,
            "code": c,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri
        };
        var that = this;
        that.upstox.getAccessToken(params)
            .then(function (response) {
                try{
                    var accessToken = response.access_token;
                    console.log("accessToken > " + accessToken);
                    //store.set('accessToken', accessToken); 
                    that.accessToken = accessToken;
                    that.upstox.setToken(accessToken);
                    that.start();
                }
                catch(e){
                    console.log( "Error > " + JSON.stringify(e));
                }
            })
            .catch(function (err) {
                console.log( "getAccessToken Error > " + JSON.stringify(err));
            });
    }

    start() {
        var that = this;
        that.getProfile();
        that.getBalance();

        that.upstox.connectSocket()
        .then(function(){
            that.upstox.on("orderUpdate", function(message) {
               // console.log("\n orderUpdate"+ JSON.stringify(message));
            });

            that.upstox.on("positionUpdate", function(message) {
                //message for position conversion
                console.log("\n positionUpdate"+ JSON.stringify(message));
            });
            
            that.upstox.on("tradeUpdate", function(message) {
                //message for trade updates
                console.log("\n tradeUpdate"+ JSON.stringify(message));
            });

            var niftyStr = [];//fno.join();

            that.upstox.subscribeFeed({
                "exchange": "NSE_FO",
                "symbol": niftyStr,
                "type": "ltp"
            })
            .then(function (response) {
                console.log('\n subscribeFeed response ', JSON.stringify(response));
            })
            .catch(function (error) {
                //res.send({ error: error });
                console.log('Error in subscribe feed ', error);
            });  

            that.upstox.on("liveFeed", function(message) {
                //message for live feed
                console.log("liveFeed"+ JSON.stringify(message));
            });
            that.upstox.on("disconnected", function(message) {
                //listener after socket connection is disconnected
                console.log("UPSTOX disconnected > "+ message);
            });
            that.upstox.on("error", function(error) {
                //error listener
                console.log("upstox.on error"+ error);
            });
        }).catch(function(error) {
                console.log( "connectSocket #" + error);
        });
    }

    // Get Balance
    getBalance()
    {
        var that = this;
        that.upstox.getBalance({ type: "security" })  // type can be security or commodity
        .then(function (response) {
            that.balance = JSON.stringify(response);
            //console.log( '\n balance' + that.balance);
           // getListOfAllSymbol();
        })
        .catch(function (err) {
            console.log(err);
            //getListOfAllSymbol();
        });
    }

    getProfile()
    {
        var that = this;
        that.upstox.getProfile()
        .then(function (response) {
            
            that.client_id = response.data.client_id;
            that.profile = JSON.stringify(response.data);
            console.log("\n getProfile - "+ that.client_id);// +" : "+  that.profile);
        })
        .catch(function (error) {
            console.log("getProfile Error"+ JSON.stringify(error));
        });
    }
}