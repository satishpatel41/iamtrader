var Upstox = require("upstox");
var moment = require('moment-timezone');


var api = "8gtPZrzCsNayGnraaxVc792UuksNxV2q3Niif4U9";
var upstox = new Upstox(api);
var fs = require('fs');
var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var code = '';
var __dirname = "views"
var exchanges =  [ 'MCX_FO', 'BSE_EQ', 'NSE_EQ', 'NSE_FO', 'NCD_FO'];
var api_secret = "697b2whx04";
var client_id="";

var accessToken;

function getAcceToken(code)
{
    var params = {
        "apiSecret": api_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri
    };
    
    upstox.getAccessToken(params)
        .then(function (response) {
            params = code = null;
                
            accessToken = response.access_token;
            //store.set('accessToken', accessToken); 
            var d  = new Date();
            
            var india = moment.tz(d, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
            india.format(); 
            
            india = india.set({
                'year' : india.year(),
                'date' : india.date() + 1,
                'hour' : 9,
                'minute'  : 05, 
                'second' : 05
             });
     
            store.set('tokenValidity', india); 
            console.log("accessToken : " +accessToken);
            upstox.setToken(accessToken);
            start();
            //res.sendFile("index.html", {"root": __dirname});
        })
        .catch(function (err) {
            console.log( "getAccessToken Error > " + JSON.stringify(err));
        });
}


function start() {
    //console.log( 'start');
    // an example using an object instead of an array
   //queue.empty();

    async.parallel({
        getProfile,
        getBalance,
        //getListOfAllSymbol,
        getAllData
    }, function(err, results) {
        console.log( 'start finish');
    });

   
       
    var bankNiftyCall;
          
    upstox.getMasterContract({exchange: "nse_fo"})
    .then(function(response) {
        //console.log("NSE FO " + JSON.stringify(response));
        
        /* bankNiftyCall = new Object();

      //  var response = JSON.parse(response);
        //console.log('\n 1.1' + response);
        var  data=csvTojs(response.data);

        //console.log("NSE FO " + JSON.stringify(data));

        var now = new Date();
        var thisMonth = months[now.getMonth()].slice(0,3).toUpperCase();
        var monthPattern = new RegExp(thisMonth, 'gi');
        
       var transformedData = JSON.parse(JSON.stringify(transformedData));
        //console.log(' >  ' + transformedData);

        var dataFrame = dataForge.fromJSON(transformedData)
        .where(row => {
     
           //console.log('\n row > ' + JSON.stringify(row));
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
        });  */
        
        console.log("FNO data >> \n \n" + transformedData);

        fs.writeFile("data/index/nse_fo.txt", JSON.stringify(response), function (err) {
            if (err) throw err;
            console.log('nse_fo File is created successfully.');
        }); 

        //checkBankNiftyExpiry();
    })
    .catch(function(err) {
        console.log("nse fo error " + JSON.stringify(err));
    });

    // Get Master Contract
   /*  upstox.getMasterContract({ exchange: "NSE_INDEX",format:"json"})
    .then(function (response) {
        fs.writeFile("data/index/index.txt", JSON.stringify(response), function (err) {
            if (err) throw err;
            console.log('index File is created successfully.');
        }); 
    })
    .catch(function (err) {
        console.log(err);
    }); */

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
            upstox.on("orderUpdate", function(message) {
                console.log("orderUpdate"+ message);
            });
            upstox.on("positionUpdate", function(message) {
                //message for position conversion
                console.log("positionUpdate"+ message);
            });
            upstox.on("tradeUpdate", function(message) {
                //message for trade updates
                console.log("tradeUpdate"+ message);
            });

            //console.log("niftyList" + niftyList);
            var niftyStr = nifty.join();
            //console.log("join" + niftyStr);

            upstox.subscribeFeed({
                "exchange": "NSE_EQ",
                "symbol": niftyStr,//'BANKNIFTY27DECFUT',//NIFTY29NOVFUT NIFTY18NOVFUT,BANKNIFTY18NOVFUT
                "type": "ltp"
            })
            .then(function (response) {
                console.log('feedsymbols subscribeFeed response ', response);
            })
            .catch(function (error) {
                //res.send({ error: error });
                console.log('Error in subscribe feed ', error);
            });  

            upstox.on("liveFeed", function(message) {
                //message for live feed
                console.log("liveFeed"+ message);
            });
            upstox.on("disconnected", function(message) {
                //listener after socket connection is disconnected
                console.log("disconnected > "+ message);
            });
            upstox.on("error", function(error) {
                //error listener
                console.log("upstox.on error"+ error);
            });
        }).catch(function(error) {
            console.log( "connectSocket #" + error);
    });
}


var nseSymbolList = [];
function getListOfAllSymbol()
{
    return store.get('niftyList'); 
}

// Get Balance
var balance;
function getBalance()
{
    //console.log( 'getBalance');
    upstox.getBalance({ type: "security" })  // type can be security or commodity
    .then(function (response) {
        balance = JSON.stringify(response);
        
        getListOfAllSymbol();
    })
    .catch(function (err) {
        console.log(err);
        getListOfAllSymbol();
    });
}


var profile;
function getProfile()
{
   // console.log( 'getProfile');
    upstox.getProfile()
    .then(function (response) {
        //console.log("getProfile "+ JSON.stringify(response));
        client_id = response.data.client_id;
        profile = JSON.stringify(response.data);
    })
    .catch(function (error) {
        console.log("getProfile Error"+ JSON.stringify(error));
    });
}
/* 
function getMaster(ex = "nse_fo"){ 
    if(store.get('accessToken')){
        return upstox.getMasterContract({exchange: ex});
    }    
} */

async function loadSymbol(symbol,exchange,interval='1day',start_date='',end_date=''){ 
    //console.log("loadSymbol > " + symbol + " > "+accessToken +" :: "+ interval +" > "+exchange +" > "+ start_date +" > "+ end_date);
    upstox.setToken(accessToken);
    return new Promise(function(resolved, rejected) {   
        upstox.getOHLC({"exchange": exchange,
            "symbol": symbol,
            "start_date": start_date,
            "end_date": end_date,
            "format" : "json",
            "interval" : interval
        }).then(result =>{
            resolved(result);
            })
        .catch(error =>{
            rejected(error);
        }); 
    });
}

function getAllData(){
    queue.empty();

    let promise = new Promise(function(resolve, reject) {
        syncAllUpstoxData(indices);
        setTimeout(function() {
            syncAllUpstoxData(watchList);
        }, 500);

        setTimeout(function() {
            resolve(1);
           // syncAllUpstoxData(indices);
        }, 47000);
          
    }).then(res=>{
        getGapUpDown(watchList);
        return Number(res) + 1;
    });

    promise.then(function(result)  {
        strategyStrongList.map(async(strategy)=>{
            applyStrategy(watchList,'1DAY',strategy); 
        });
        return Number(result) + 1;
    });
}

var stockData = []; 
var data = {};
var promiseArr = [];
 
async function loadAllSymbolData(response,interval='1DAY',start_date='11-11-2018'){ 
    console.log('* Step 1 : loadSymbol ');
    promiseArr = [];
    return Promise.all(response.map(function(symbol) { 
      return loadSymbol(symbol,'NSE_EQ',interval,start_date).then(function (response) {
            try {
                    console.log('* loadSymbol ' + JSON.stringify(response));
                    stockData =response.data;
                    //console.log('* loadSymbol symbol  > ' +symbol +" :: "+interval +" :: "+start_date+" :: "+ stockData);// +":: "+stockData);

                    var inputRSI = {
                        values : [],
                        period : 14
                    };
                    /* rsi = new technicalindicators.RSI(inputRSI);
                    var inputSMA = {
                        values : [],
                        period : 20
                    };
                    sma= new technicalindicators.SMA(inputSMA);
                    var inputBB = {
                        period : 14, 
                        values : [],
                        stdDev : 2 
                    }
                    bb = new technicalindicators.BollingerBands(inputBB); */
                    inputBB = inputRSI = inputSMA = null;
                    
                    stockData.map(row => {
                        if(row && Number(row.close) > 0){
                            /* row.rsi = rsi.nextValue(Number(row.close));
                            row.sma = sma.nextValue(Number(row.close));
                            row.bb = bb.nextValue(Number(row.close));  */
                        }
                        row.change = getPercentageChange(Number(lastObject.close),Number(row.close)); 
                    
                        if(row.bb && Number(row.close) >= Number(row.bb.upper))// && lastObject && Number(lastObject.close) < Number(lastObject.bb.upper))
                        {
                            row.bb.isCrossed = 'Crossed Above';
                        }
                        else if(row.bb && Number(row.close) <= Number(row.bb.lower))// && lastObject && Number(lastObject.close) > Number(lastObject.bb.lower))
                        {
                            row.bb.isCrossed = 'Crossed Below';
                        }
                        lastObject = row;
                        
                        return row;
                    });
               
                stockData.reverse();
                var timestamp;
               
                if(stockData[0].timestamp > 0){
                    var d =new Date(Number(stockData[0].timestamp));
                    var india = moment.tz(d, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
                    india.format(); 
                    //console.log(india +" : "+ stockData[0].timestamp +" : "+ d);
                    if(india.minute() > 0)
                        timestamp = india.date() +"/"+(india.month()+1) +"/"+india.year()+" "+india.hour()+":"+india.minute();
                    else
                        timestamp = india.date() +"/"+(india.month()+1) +"/"+india.year();            
                }   
                
                
                data = {
                    "symbol":symbol,
                    "close":stockData[0].close,
                    "volume":stockData[0].volume,
                    "rsi":stockData[0].rsi,
                    "timestamp":timestamp,
                    "sma":stockData[0].sma, 
                    "bb":stockData[0].bb,
                    "change":stockData[0].change
                }; 
                //console.log("data   > " + JSON.stringify(data));
                stockData = null;
                promiseArr.push(data);
                return data;
              } catch (err) {
                console.log("loadAllSymbolData : err   > " + err);
                //return err;
              }
        });
    }));
}


async function getUpstoxData(response,interval='1DAY',start_date='',end_date=''){ 
    console.log('* Step 1 : loadSymbol ');
    promiseArr = [];
    return Promise.all(response.map(function(symbol) { 
      return loadSymbol(symbol,'NSE_EQ',interval,start_date,end_date).then(function (response) {
            try {
                    console.log('* loadSymbol ' + JSON.stringify(response));
                    stockData =response.data;
                    promiseArr.push(data);
                    return data;
                } catch (err) {
                console.log("loadAllSymbolData : err   > " + err);
                //return err;
                }
        });
    }));
}

