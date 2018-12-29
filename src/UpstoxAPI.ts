var Upstox = require("upstox");
var api = "cIs71szuLZ7WFKInU8O0o7GTHm5QIJke8ahnzLVw";
var upstox = new Upstox(api);
var schedule = require('node-schedule');
var fs = require('fs');
var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var code = '';
var __dirname = "views"
var exchanges =  [ 'MCX_FO', 'BSE_EQ', 'NSE_EQ', 'NSE_FO', 'NCD_FO'];
var login_code = "ce728b73424e719680aa66a51ba4eb469f9875f2";
var api_secret = "xs5ibb0pk0";
var client_id="";
var watchList = ['banknifty','hindalco','ICICIBANK','sbin','idea','lt','HAVELLS'];
var accessToken;

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
            params = api_secret = code = null;

            accessToken = response.access_token;
            log("****accessToken*\n" +accessToken);
            upstox.setToken(accessToken);
            //accessToken = null;
            
            start();
            //res.sendFile("index.html", {"root": __dirname});
        })
        .catch(function (err:any) {
            log( "getAccessToken > " + err);
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
        

       // console.log(' >  ' + transformedData);

        var dataFrame = dataForge.fromJSON(transformedData)
        .where(row => {
     
           // console.log('\n row > ' + JSON.stringify(row));
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
       
        // var j = schedule.scheduleJob('0 18 * * *', function(){
        //     log('Daily data update');
        //     loadAllSymbolData(transformedData,'1DAY','1-1-2005');
        // });

        // var newDate = new Date();
        // newDate.setDate(newDate.getDate() - 10);//240     
        
        // var j = schedule.scheduleJob('*/60 * * * *', function(){
        //     log('NSE 60MINUTE data update');
        //     loadAllSymbolData(transformedData,'60MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        // });

        // var j = schedule.scheduleJob('*/30 * * * *', function(){
        //     log('NSE 30MINUTE data update');
        //     loadAllSymbolData(transformedData,'30MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        // });

        // var newDate = new Date();
        // newDate.setDate(newDate.getDate() - 5);     
        // var j = schedule.scheduleJob('*/10 * * * *', function(){
        //     log('NSE 10MINUTE data update');
        //     loadAllSymbolData(transformedData,'10MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        // });

        // var newDate = new Date();
        // newDate.setDate(newDate.getDate() - 5);     
        // var j = schedule.scheduleJob('*/5 * * * *', function(){
        //     log('NSE 10MINUTE data update');
        //     loadAllSymbolData(transformedData,'5MINUTE',newDate.getDate()+"-"+newDate.getMonth()+"-"+newDate.getFullYear());
        // });
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
        log( "connectSocket #" + error);
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
         getAllData();
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
        getListOfAllSymbol();
    })
    .catch(function (err:any) {
        log(err);
        getListOfAllSymbol();
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


function loadSymbol(symbol,exchange,interval='1day',start_date='1-1-2018'){ 
    //log("loadSymbol > " + symbol + " > "+ interval +" > "+exchange);
    if(accessToken){
        return upstox.getOHLC({"exchange": exchange,
            "symbol": symbol,
            "start_date": start_date,
            "format" : "json",
            "interval" : interval
        })  
    }    
}

function getAllData(){
  // syncStockData();
}

function syncStockData(){ 
    /* setTimeout(function(){ load1dayData(); }, 60000);
    setTimeout(function(){ load60minData(); }, 30000);
    setTimeout(function(){ load30minData(); }, 20000);
    setTimeout(function(){ load10minData(); }, 10000);
    setTimeout(function(){ load5minData(); }, 10);  */
    
    delay(10).then(() => load5minData());
    delay(10000).then(() => load10minData());
    delay(20000).then(() => load30minData());
    delay(30000).then(() => load60minData());
    delay(60000).then(() => load1dayData());
}

const delay = t => new Promise(resolve => setTimeout(resolve, t));

//var allSymbolWithIndicator = [];
var stockData = []; 
var data = {};
var promiseArr = [];

async function loadAllSymbolData(response:any,interval='1day',start_date='11-11-2018'){ 
    //var allSymbolWithIndicator = [];
    
    //log( "loadAllSymbolData ******** " +  response);
    promiseArr = [];
    promiseArr = response.map(async symbol => {
        data = {};
        stockData = [];
        //console.log("symbol " + interval +" >> "+symbol);
        await loadSymbol(symbol,'nse_eq',interval,'9-9-2018').then(function (response:any) {
            stockData =response.data;
            stockData.map(row => {
                row.timestamp = new Date(row.timestamp);
                row.rsi = rsi.nextValue(Number(row.close));
                row.sma = sma.nextValue(Number(row.close));
                row.bb = bb.nextValue(Number(row.close)); 

                if(Number(row.close) > row.bb.upper)
                {
                    row.bb.isCrossed = 'Crossed Above';
                }
                else if(Number(row.close) < row.bb.lower)
                {
                    row.bb.isCrossed = 'Crossed Below';
                }
                else
                {
                    row.bb.isCrossed = '';
                }
                return row;
            });
            stockData.reverse();
            data = {
                "symbol":symbol,
                "close":stockData[0].close,
                "volume":stockData[0].volume,
                "rsi":stockData[0].rsi,
                "timestamp":stockData[0].timestamp,
                "sma":stockData[0].sma, 
                "bb":stockData[0].bb
            }; 
            stockData = null;
        })
        .catch(function(error:any){
            console.log("loadSymbol error > " +  JSON.stringify(error));
        });
        symbol = null;

        return data;
    });

    return Promise.all(promiseArr).then(function(res) {
        return res.filter(Boolean);;
    });
}

