var Upstox = require("upstox");
var events = require('events');
var port = process.env.PORT || 3000;
var redirect_uri = "http://localhost:"+port+"/callback/";
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
       // console.log("loginUri ***" + api +" > "+ api_secret +" > "+ isAutomated);
       // console.log("loginUri ***" + api +" > "+);
        if(!isAutomated){
            this.loginUrl = this.upstox.getLoginUri(redirect_uri);
            //console.log("loginUri ***" + this.loginUrl);
        }
        eventEmitter.on('placeOrder', onPlaceOrder);

        function getLoginURL(){
            return this.loginUrl;
        }

        function onPlaceOrder(data){
            var isValidUser = false;
            userObjList.map(userObj=>{
                if(userObj.user == that.client_id)
                {
                    isValidUser =true;
                }
            });

            if(isValidUser){
                //webSocket.send(JSON.stringify({data}));
               
                //Validate my orders with db
                console.log('\nEvent -> onPlaceOrder ' + data.strategy.name +":"+data.symbol+":"+data.strategy.transaction_type+":"+data.strategy.exchange+":"+data.strategy.odrerType+":"+data.strategy.isIntraday);
                //that.upstox.setToken(that.accessToken);
                var orderObject = {
                    transaction_type:getTransactionType(data.strategy.transaction_type),
                    exchange:getExchange(data.strategy.exchange),
                    symbol: getSymbol(data.symbol),
                    price:data.price,
                    quantity: data.strategy.quantity,
                    order_type:getOrderType(data.strategy.odrerType),
                    product: getProduct(data.strategy.isIntraday),
                };
                //console.log('\nEvent -> onPlaceOrder -> orderObject - ' + that.accessToken +":"+JSON.stringify(orderObject));
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
                //console.log('Error in subscribe feed ', error);
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

function getOrderType(odrerType){
    var  odrer = '';
    if(odrerType == "market"){
        odrer = 'M';
    }
    else if(odrerType == "limit"){
        odrer = 'L';
    }
    else if(odrerType == "stopLossLimit"){
        odrer = 'SL';
    }
    else if(odrerType == "stopLossMarket"){
        odrer = 'SL-M';
    }
    return odrer;
}

function getDuration(duration){
    var  dur = '';
    if(duration == "DAY"){
        dur = 'DAY';
    }
    else if(duration == "IOC"){
        dur = 'IOC';
    }
    else if(duration == "GTD"){
        dur = 'GTD';
    }
    
    return dur;
}

function getProduct(product){
    var  pro = '';
    if(product == "Intraday"){
        pro = 'I';
    }
    else if(product == "Delivery"){
        pro = 'D';
    }
    else if(product == "CO"){
        pro = 'CO';
    }
    else if(product == "OCO"){
        pro = 'OCO';
    }
    return pro;
}

function getExchange(exchange){
    var upstoxEx =  '';
    if(exchange == "NFO"){
        upstoxEx = 'nse_fo';
    }
    else if(exchange == "NSE"){
        upstoxEx = 'nse_eq';
    }
    else if(exchange == "MCX"){
        upstoxEx = 'mcx_fo';
    }
    else if(exchange == "CDS"){
        upstoxEx = 'ncd_fo';
    }
    else if(exchange == "NSE_IDX"){
        upstoxEx = 'nse_index';
    }
    else{
        upstoxEx = '';
    }
    return upstoxEx;
    
}

function getTransactionType(transaction_type){
    var transaction =  '';
    if(transaction_type == "sell"){
        transaction = 'S';
    }
    else if(transaction_type == "buy"){
        transaction = 'B';
    }
    return transaction;
}


function getSymbol(symbol){
    var sym =  '';
    var symbolArr = symbol.split('_');
    //console.log("symbolArr " + symbolArr);
    var now = new Date();
    var year = now.getFullYear();

    var isFutureStock = symbol.search('FUTSTK');
    var isFutureIndex = symbol.search('FUTIDX');
    var isOptionIndex = symbol.search('OPTIDX');
    var isOptionStock = symbol.search('OPTSTK');
    
    //console.log("isOptionStock " + isFutureStock+ isFutureIndex+ isOptionIndex+ isOptionStock);
    if(isFutureStock >= 0 || isFutureIndex >= 0){
        sym = symbolArr[1] + String(year).substring(2,4) + String(String(symbolArr[2]).split(year)[0]).substring(2,5) + 'FUT';
    }
    else if(isOptionIndex >= 0 || isOptionStock >= 0 ){
        var dateMonth = String(String(symbolArr[2]).split(year)[0]);
        var month = 0;
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

        for(var i= 0; i < months.length;i++){
            if(String(months[i]).toLowerCase().search(dateMonth.substring(2,5).toLowerCase()) >= 0){
                break;
            }
        }
        sym = symbolArr[1] + String(year).substring(2,4) + Number(i+1) +dateMonth.substring(0,2) + symbolArr[4]+ symbolArr[3];
    }
    //console.log("sym " + sym);
    return sym;
}