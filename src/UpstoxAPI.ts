/* class UpstoxAPI {
    fullName: string;
    constructor(public firstName: string, public middleInitial: string, public lastName: string) {
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
}

 */
var $ = require("jquery");
var Awesomplete = require("Awesomplete");
var Upstox = require("upstox");
var api = "cIs71szuLZ7WFKInU8O0o7GTHm5QIJke8ahnzLVw";
var upstox = new Upstox(api);
var schedule = require('node-schedule');

var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

var code = '';
var __dirname = "views"
var exchanges =  [ 'MCX_FO', 'BSE_EQ', 'NSE_EQ', 'NSE_FO', 'NCD_FO'];
var login_code = "ce728b73424e719680aa66a51ba4eb469f9875f2";
var api_secret = "xs5ibb0pk0";
var port = 8080;
var redirect_uri = "http://127.0.0.1:"+port;
var client_id="";
    
var watchList = ['banknifty','hindalco','ICICIBANK','sbin','idea','lt','HAVELLS'];

var loginUrl = upstox.getLoginUri(redirect_uri);

function getLogin()
{
    var loginUrl = upstox.getLoginUri(redirect_uri);
    console.log("**************** loginUri ***********\n" + loginUrl);
    return loginUrl;
}

function getAcceToken(code:any)
{
    var params = {
        "apiSecret": api_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri
    };
    
    upstox.getAccessToken(params)
        .then(function (response:any) {
            var accessToken = response.access_token;
            log("****accessToken*\n" +accessToken);
            upstox.setToken(accessToken);
            
            start();
            //res.sendFile("index.html", {"root": __dirname});
        })
        .catch(function (err:any) {
            log( "******** " + err);
    });
}


function start() {
    getProfile();
       
    var bankNiftyCall:any;
          
    upstox.getMasterContract({exchange: "nse_fo1"})
    .then(function(response:any) {
        //console.log("NSE FO " + JSON.stringify(response));
        
        bankNiftyCall = new Object();

      //  var response = JSON.parse(response);
        //console.log('\n 1.1' + response);
        var  data=csvTojs(response.data);
        var now = new Date();
        var thisMonth = months[now.getMonth()].slice(0,3).toUpperCase();
        var monthPattern = new RegExp(thisMonth, 'gi');
        
        var csvOptions = { columnNames: ["symbol", "name", "closing_price", "expiry", "strike_price", "lot_size", "instrument_type"] };
       // var transformedData =[];//new dataForge.DataFrame(data);
        //.toJSON()
        /* .toArray()
        */
       var transformedData = JSON.parse(JSON.stringify(transformedData));
        

        console.log(' >  ' + transformedData);

        var dataFrame = dataForge.fromJSON(transformedData)
        .where(row => {
     
            console.log('\n row > ' + JSON.stringify(row));
            row = JSON.stringify(row);
           // console.log('\n row > ' + JSON.stringify(row));
           // console.log('\n symbol > ' + row.symbol);
            var isMatchingMonth  = String(row.symbol).search(monthPattern);
            var isFuture = String(row.symbol).search("FUT");

            if(isMatchingMonth >= 0 && isFuture >=0){
                console.log("\n \n MATCH  >> > " + row.symbol );
                bankNiftyCall.FUTURE = row.symbol;
                return row;
            }
        }); 


        
       log("FNO data >> \n \n" + transformedData);


        fs.writeFile("data/index/nse_fo.txt", JSON.stringify(response), function (err:any) {
            if (err) throw err;
            console.log('nse_fo File is created successfully.');
        }); 
       
        var j = schedule.scheduleJob('0 18 * * *', function(){
            log('Daily data update');
            loadAllSymbolData(transformedData,'1DAY','1-1-2005');
        });

        var newDate = new Date();
        newDate.setDate(newDate.getDate() - 10);//240     
        
        var j = schedule.scheduleJob('*/60 * * * *', function(){
            log('NSE 60MINUTE data update');
            loadAllSymbolData(transformedData,'60MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        });

        var j = schedule.scheduleJob('*/30 * * * *', function(){
            log('NSE 30MINUTE data update');
            loadAllSymbolData(transformedData,'30MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        });

        var newDate = new Date();
        newDate.setDate(newDate.getDate() - 5);     
        var j = schedule.scheduleJob('*/10 * * * *', function(){
            log('NSE 10MINUTE data update');
            loadAllSymbolData(transformedData,'10MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        });

        var newDate = new Date();
        newDate.setDate(newDate.getDate() - 5);     
        var j = schedule.scheduleJob('*/5 * * * *', function(){
            log('NSE 10MINUTE data update');
            loadAllSymbolData(transformedData,'5MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        });
    })
    .catch(function(err:any) {
        console.log("nse fo error " + JSON.stringify(err));
    });

    // Get Master Contract
    upstox.getMasterContract({ exchange: "NSE_INDEX",format:"json"})
    .then(function (response:any) {
        fs.writeFile("data/index/index.txt", JSON.stringify(response), function (err:any) {
            if (err) throw err;
                log('index File is created successfully.');
        }); 
    })
    .catch(function (err:any) {
        log(err);
    });

    // PlaceOrder Note : default product = I i.e intra day order will be placed.
    /*var orderObject = {
        transaction_type:"b",
        exchange:"NSE_EQ",
        symbol: "RELIANCE",
        quantity: 1,
        order_type:"m"
    };

    upstox.placeOrder(orderObject)
        .then(function(response) {
            // Order details received
            console.log(response);
        })
        .catch(function(err) {
            // Something went wrong.
            console.log(err);
        });
    */

    upstox.connectSocket()
        .then(function(){
            upstox.on("orderUpdate", function(message:any) {
                log("orderUpdate"+ message);
            });
            upstox.on("positionUpdate", function(message:any) {
                //message for position conversion
                log("positionUpdate"+ message);
            });
            upstox.on("tradeUpdate", function(message:any) {
                //message for trade updates
                log("tradeUpdate"+ message);
            });

            upstox.subscribeFeed({
                "exchange": "NSE_FO",
                "symbol": 'BANKNIFTY27DECFUT',//NIFTY29NOVFUT NIFTY18NOVFUT,BANKNIFTY18NOVFUT
                "type": "ltp"
            })
            .then(function (response:any) {
                console.log('feedsymbols subscribeFeed response ', response);
                //res.send({ error: error });
            })
            .catch(function (error:any) {
                //res.send({ error: error });
                console.log('Error in subscribe feed ', error);
            });  

            upstox.on("liveFeed", function(message:any) {
                //message for live feed
                log("liveFeed"+ message);
            });
            upstox.on("disconnected", function(message:any) {
                //listener after socket connection is disconnected
                log("disconnected"+ message);
            });
            upstox.on("error", function(error:any) {
                //error listener
                log("error"+ error);
            });
        }).catch(function(error:any) {
        log( "******** " + error);
    });
}


var nseSymbolList = [];
function getListOfAllSymbol()
{
   upstox.getMasterContract({ exchange: "nse_eq",format:"json" })
    .then(function (response:any) {
        var list = response.data;
        nseSymbolList = list.map(x => x.symbol);
        getAllData();
     })
     .catch(function (err:any) {
         log( "Error getListOfAllSymbol > " +  err);
    }); 
}

// Get Balance
var balance;
function getBalance()
{
    upstox.getBalance({ type: "security" })  // type can be security or commodity
    .then(function (response:any) {
        balance = JSON.stringify(response);
        /* log("****************** Balance ******************\n");
        fs.writeFile("data/balance/"+client_id+'-balance.txt', JSON.stringify(response), function (err:any) {
        if (err) throw err;
            log('balance is created successfully.');
        });   */
    })
    .catch(function (err:any) {
        log(err);
    });
}


var profile;
function getProfile()
{
    upstox.getProfile()
    .then(function (response:any) {
        client_id = response.data.client_id;
        profile = JSON.stringify(response.data);
        getBalance();
        getListOfAllSymbol();
            
        /* fs.writeFile("data/profile/"+client_id+'.txt', JSON.stringify(response), function (err:any) {
        if (err) throw err;
            log('client_id is created successfully.');
        });  

        /*  var watchList = ['dlf','hindalco','ICICIBANK','sbin','yesbank','reliance','idea','WIPRO','lt','HAVELLS']
        watchList.map(async (obj) => {
            loadAllSymbolData(obj,'1DAY','1-1-2005');
        }); 
         */
    
    })
    .catch(function (error:any) {
        log("Error"+ error);
    });
}


function loadSymbol(symbol,exchange,interval='1day',start_date='1-1-2010'){ 
    log("loadSymbol > " + symbol + " > "+ interval +" > "+exchange);
    return upstox.getOHLC({"exchange": exchange,
        "symbol": symbol,
        "start_date": start_date,
        "format" : "json",
        "interval" : interval
    })
}

function getAllData(){
   
    upstox.getMasterContract({ exchange: "nse_eq",format:"json" })
    .then(function (response:any) {

        var weekly = schedule.scheduleJob('* 17 * * 5', function(){
            log('Weekly data update');
            loadAllSymbolData(response.data,'1WEEK','1-1-2015');
            });

        var Montly = schedule.scheduleJob('0 8 1 * *', function(){
            log('Montly data update');
            loadAllSymbolData(response.data,'1MONTH','1-1-2015');
        });
        
        var daily = schedule.scheduleJob('0 18 * * *', function(){
            log('Daily data update');
            loadAllSymbolData(response.data,'1DAY','1-1-2015');
        });

        var newDate = new Date();
        newDate.setDate(newDate.getDate() - 10);//240    
        
        var hourly = schedule.scheduleJob('*/60 * * * *', function(){
            log('NSE 60MINUTE data update');
            loadAllSymbolData(response.data,'60MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        });

        var min_30 = schedule.scheduleJob('*/30 * * * *', function(){
            log('NSE 30MINUTE data update');
            loadAllSymbolData(response.data,'30MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        });

        var newDate = new Date();
        newDate.setDate(newDate.getDate() - 2);     
        var min_10 = schedule.scheduleJob('*/10 * * * *', function(){
            log('NSE 10MINUTE data update');
            loadAllSymbolData(response.data,'10MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        });

        var newDate = new Date();
        newDate.setDate(newDate.getDate() - 1);     
        var min_50 = schedule.scheduleJob('*/5 * * * *', function(){
            log('NSE 10MINUTE data update');
            loadAllSymbolData(response.data,'10MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        });
    })
    .catch(function (err:any) {
        log( "getAllData ******** " +  err);
    }); 
}


var allSymbolWithIndicator = [];
function loadAllSymbolData(response:any,interval='1day',start_date='1-1-2010'){ 
    allSymbolWithIndicator = [];

    response.map((obj) => {
        log("\n loadAllSymbolData ********* > " + obj.symbol + " >> "+ interval);
        upstox.getOHLC({"exchange": obj.exchange,
            "symbol": obj.symbol,
            "start_date": start_date,
            "format" : "json",
            "interval" : interval
        })
        .then(function (response:any) {
            var stockData =response.data;
                stockData.map(row => {
                    row.timestamp = new Date(row.timestamp);
                    row.rsi = rsi.nextValue(Number(row.close));
                    row.sma = sma.nextValue(Number(row.close));
                    row.bb = bb.nextValue(Number(row.close)); 
                    return row;
                });
                stockData.reverse();
                var obj = {"symbol":obj.symbol,
                      "close":stockData[0].close,
                      "volume":stockData[0].volume,
                      "rsi":stockData[0].rsi,
                      "timestamp":stockData[0].timestamp,
                      "sma":stockData[0].sma, 
                      "bb":stockData[0].bb
                };    
                log("loadAllSymbolData  : : > " + obj.symbol + " >> "+ JSON.stringify(obj) + " >> "+ interval);
                allSymbolWithIndicator.push(obj)
        })
        .catch(function(error:any){
            log("error  : : > " +  JSON.stringify(error));
        });
    });
}