var Upstox = require("upstox");
var api = "cIs71szuLZ7WFKInU8O0o7GTHm5QIJke8ahnzLVw";
var upstox = new Upstox(api);
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
            store.set('accessToken', accessToken); 

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
          
    upstox.getMasterContract({exchange: "nse_fo"})
    .then(function(response:any) {
        //console.log("NSE FO " + JSON.stringify(response));
        
        bankNiftyCall = new Object();

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
        }); 
        
       log("FNO data >> \n \n" + transformedData);

        fs.writeFile("data/index/nse_fo.txt", JSON.stringify(response), function (err:any) {
            if (err) throw err;
            console.log('nse_fo File is created successfully.');
        }); 

        checkBankNiftyExpiry();
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

            //console.log("niftyList" + niftyList);
            var niftyStr = niftyList.join();
            //console.log("join" + niftyStr);

            upstox.subscribeFeed({
                "exchange": "nse_eq",
                "symbol": niftyStr,//'BANKNIFTY27DECFUT',//NIFTY29NOVFUT NIFTY18NOVFUT,BANKNIFTY18NOVFUT
                "type": "ltp"
            })
            .then(function (response:any) {
                console.log('feedsymbols subscribeFeed response ', response);
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
                log("disconnected > "+ message);
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
        store.set('nseSymbolList', nseSymbolList); 
        getAllData();
     })
     .catch(function (err:any) {
         log( "Error getListOfAllSymbol > " +  JSON.stringify(err));
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

function getMaster(ex = "nse_fo"){ 
    if(accessToken){
        return upstox.getMasterContract({exchange: ex});
    }    
}

function loadSymbol(symbol,exchange,interval='1day',start_date='12-12-2018'){ 
    log("loadSymbol > " + symbol + " > "+ interval +" > "+exchange +" > "+ start_date);
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
    delay(10).then(() => load5minData());
    delay(10000).then(() => load10minData());
    delay(20000).then(() => load30minData());
    delay(30000).then(() => load60minData());
    delay(60000).then(() => load1dayData());
}

const delay = t => new Promise(resolve => setTimeout(resolve, t));

var stockData = []; 
var data = {};
var promiseArr = [];
 
async function loadAllSymbolData(response:any,interval='1DAY',start_date='11-11-2018'){ 
    console.log('* Step 1 : loadSymbol ');
    promiseArr = [];
    return Promise.all(response.map(function(symbol) { 
      return loadSymbol(symbol,'nse_eq',interval,start_date).then(function (response:any) {
            stockData =response.data;
            //console.log('**** loadSymbol response  > ' +symbol +":: "+stockData);
            
            var inputRSI:Object = {
                values : [],
                period : 14
            };
            rsi = new technicalindicators.RSI(inputRSI);
            var inputSMA:Object = {
                values : [],
                period : 20
            };
           
            sma= new technicalindicators.SMA(inputSMA);
    
            var inputBB:Object = {
                period : 14, 
                values : [],
                stdDev : 2 
            }
           
            bb = new technicalindicators.BollingerBands(inputBB);
            inputBB = inputRSI = inputSMA = null;
            //console.log('**** 1   > ');
            stockData.map(row => {
                console.log('**** 2   > ');
                var india = moment.tz(new Date(row.timestamp), "Asia/Kolkata");
                india.format(); 
                if(india.minute() > 0)
                    row.timestamp = india.date() +"/"+(india.month()+1) +"/"+india.year()+" "+india.hour()+":"+india.minute();
                else
                    row.timestamp = india.date() +"/"+(india.month()+1) +"/"+india.year();
                
                row.rsi = rsi.nextValue(Number(row.close));
                row.sma = sma.nextValue(Number(row.close));
                row.bb = bb.nextValue(Number(row.close)); 
                //row.change = getPercentageChange(Number(lastObject.close),Number(row.close)); 
                //console.log('**** 3   > ');
                if(row.bb && Number(row.close) >= Number(row.bb.upper))// && lastObject && Number(lastObject.close) < Number(lastObject.bb.upper))
                {
                    row.bb.isCrossed = 'Crossed Above';
                }
                else if(row.bb && Number(row.close) <= Number(row.bb.lower))// && lastObject && Number(lastObject.close) > Number(lastObject.bb.lower))
                {
                    row.bb.isCrossed = 'Crossed Below';
                }
                //lastObject = row;
                //console.log('**** 4   > ');
                return row;
            });
            //console.log('**** 5   > ');
            stockData.reverse();
            data = {
                "symbol":symbol,
                "close":stockData[0].close,
                "volume":stockData[0].volume,
                "rsi":stockData[0].rsi,
                "timestamp":stockData[0].timestamp,
                "sma":stockData[0].sma, 
                "bb":stockData[0].bb,
                "change":stockData[0].change
            }; 
            console.log("\n data   > " + JSON.stringify(data));
            stockData = null;
            promiseArr.push(data);
            return data;
        });
    }));
}

