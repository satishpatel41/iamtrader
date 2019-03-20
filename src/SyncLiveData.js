var fs = require('fs');
var path = require('path');
var loki  = require( 'lokijs' );
var intervalsArr = ['1MONTH','1WEEK','1DAY','60MINUTE','30MINUTE','10MINUTE','5MINUTE'];
var database;

var queue = async.queue(function(task, callback) {
    //console.log('async.queue    ' +task.interval+"> "+ task.symbol);
    if(task.symbol){

        var symbolfile;
        try{      
            symbolfile = path.resolve(path.join(__dirname, '..', 'db/stock/'+task.interval+'/'+task.symbol+'.db'));
        }
        catch(e){
            console.log("Error > " + e);
        }

        var lokiJson = new loki(symbolfile, 
        {
            autoload: true,
            autoloadCallback : loadHandler,
            autosave: true, 
            autosaveInterval: 10000
        }); 
        
        function loadHandler() {
            var database = lokiJson.getCollection(task.symbol);
            if(!database){
                database = lokiJson.addCollection(task.symbol);
            }  
         
           var stockData = [];
            return loadSymbol(task.symbol,'NSE_EQ',task.interval,task.start_date,task.end_date).then(function (response) {
                try {
                        if(response != '' && response != undefined && response != null){
                            stockData = response;
                            if(response.error){
                                console.log('Queue error ' + JSON.stringify(response.error));
                            }
                            else if(database.get(1) && database.get(1).data && database.get(1).data.timestamp && database.get(1).data.timestamp === response.timestamp){
                                console.log('Do nothing   ' +task.interval+"> "+ task.symbol);
                            }
                            else{
                               // console.log('UPDATE   ' +task.interval+"> "+ task.symbol);
                                database.clear();
                                database.insert(stockData);      
                            }
                            lokiJson.saveDatabase();    
                            callback();         
                        } 
                        else{
                            callback();     
                        }
                      
                   // stockData = null;
                    
                  } catch (err) {
                    console.log("loadHandler queue : err   > " + err);
                    callback();    
                    //return err;
                  }
            });
           /*  var filePath = 'data/stock/'+task.interval+'/'+task.symbol+'.txt';                 
            fs.exists(filePath, function(exists) {
                if (exists){
                    fs.readFile(filePath, 'utf8', function(err, response) {
                        if (err) console.log('readFile  ' +err);
                        if(response != '' && response != undefined && response != null){
                            var obj = JSON.parse(response);
                            //console.log("read file  > " +  database +"::"+database.get(1).timestamp +" : "+ obj.timestamp);
                            if(database.get(1) && database.get(1).timestamp && database.get(1).timestamp === obj.timestamp){
                                //console.log('update   ' +task.interval+"> "+ task.symbol);
                            }
                            else{
                                console.log('****************UPDATE   ' +task.interval+"> "+ task.symbol);
                                database.clear();
                                database.insert(obj);      
                            }
                            lokiJson.saveDatabase();    
                            callback();         
                        } 
                    });
                }
                else{
                    callback();
                }
            }); */     
        }  
    } 
}, 4);

var strategy_smaCross1 = [
{
    indicators:
    [
        {indicator:'SMA',period : 20,values:"closes"},
        {indicator:'SMA',period : 50,values:"closes"}
    ],output:[],strategy:"output[0][0] >= output[1][0]"
},
{
    indicators:
    [
        {indicator:'SMA',period : 20,values:"closes"},
        {indicator:'SMA',period : 50,values:"closes"}
    ],output:[],strategy:"output[0][1] < output[1][1]"
}
]; 
var strategy_sma200 = [
    {
        indicators:
        [
            {indicator:'SMA',period : 20,values:"closes"},
            {indicator:'SMA',period : 50,values:"closes"}
        ],output:[],strategy:"output[0][0] >= output[1][0]"
    },
    {
        indicators:
        [
            {indicator:'SMA',period : 20,values:"closes"},
            {indicator:'SMA',period : 50,values:"closes"}
        ],output:[],strategy:"output[0][1] < output[1][1]"
    }
]; 
var strategy_smaCross = [
    {
        indicators:
        [
            {indicator:'SMA',period : 200,values:"closes"}
        ],output:[],strategy:"closes[0] >= output[0][0]"
    },
  /*   {
        indicators:
        [
            {indicator:'SMA',period : 200,values:"closes"}
        ],output:[],strategy:"closes[0] <= output[0][1]"
    }, */
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) >= 0.5"
    }  
]; 
var strategy_rsi60_crossed = [
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][0] >= 60"
    }, 
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][1] <= 60"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) >= 0.5"
    }  
]; 

var strategy_rsi40_crossed = [
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][0] <= 40"
    }, 
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][1] >= 40"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) <= -0.5"
    }  
]; 


var strategy_bbLower = [
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"closes[0] <= output[0][0]['lower']"
    },
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"closes[1] >= output[0][1]['lower']"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"closes[0] < opens[0]"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) <= -0.5"
    }
]; 
var strategy_bbUpper_band_crossed = [
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"closes[0] >= output[0][0]['upper']"
    },
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"closes[1] <= output[0][1]['upper']"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"closes[0] > opens[0]"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) >= 0.5"
    } 
]; 
  
//syncLiveAllStockData(store.get('nseSymbolList')); 
//syncLiveStockDataByInterval(store.get('nseSymbolList'),'5MINUTE'); 
//getStockDataByInterval('BATAINDIA','1DAY',strategy_rsi60);
//getAllStockDataByInterval(store.get('niftyList'),'1DAY',strategy_rsi60);
//getAllStockDataByInterval(['ULTRACEMCO','ENGINERSIN','DRREDDY','HINDALCO','LT','MINDTREE','PCJEWELLER'],'1DAY',strategy_rsi60);
//getAllStockDataByInterval(['ULTRACEMCO','VEDL','SBIN'],'1DAY');
//getAllData();
/* getAllStockDataByInterval(store.get('fnoList').sort(),'1DAY',strategy_rsi60_crossed);

getAllStockDataByInterval(store.get('fnoList').sort(),'1DAY',strategy_rsi40_crossed);

//getAllStockDataByInterval(store.get('fnoList').sort(),'1DAY',strategy_rsi60_crossed);
//getAllStockDataByInterval(['ULTRACEMCO','ENGINERSIN','DRREDDY','HINDALCO','LT','MINDTREE','PCJEWELLER'],'1DAY',strategy_bbUpper_band_crossed);
getAllStockDataByInterval(store.get('fnoList').sort(),'1DAY',strategy_bbLower); */

getAllStockDataByInterval(store.get('fnoList').sort(),'15MINUTE',strategy_rsi40_crossed);


async function syncLiveAllStockData(list,interval,start_date,end_date){ 
    //intervalsArr.map(async (interval) =>  {
        list.map(async (x) =>  {
            var symbol = x.symbol ? x.symbol:x;        
            queue.push({symbol: symbol,interval:interval,start_date:start_date,end_date:end_date}, function (err) {
              //  console.log('SyncLiveAllStockData : Finished Queue  - ' + interval);
            });
        }); 
    //});          
}

async function getAllStockDataByInterval(list,interval,strategy){ 
   // console.log("* getAllStockDataByInterval   >> "+list.length);
        Promise.all(list.map(async (x) =>  {
        var symbol = x.symbol ? x.symbol:x;    
        return getStock(symbol,interval);          
        })).then(stockData => {
      //      console.log("* getAllStockDataByInterval  "+stockData.length);
            stockData.map(async (dataObj) =>  {
                try{
                    var data = JSON.parse(dataObj.data); 
                    await getIndicator(dataObj.symbol,data,strategy,false);
                }
                catch(e){
                    console.log("Error " + e);
                }
            });   
        })
        .catch(error => { 
            console.log(error)
        }); 
}

async function syncLiveStockDataByInterval(list,interval){ 
    list.map(async (x) =>  {
        var symbol = x.symbol ? x.symbol:x;        
        queue.push({symbol: symbol,interval:interval}, function (err) {
            //console.log('syncLiveStockDataByInterval : Finished Queue' + interval);
        });       
    }); 
}

function getStockDataByInterval(symbol,interval,strategy){ 
    getStock(symbol,interval)
    .then(dataObj  => {
        //console.log("symbol  "+dataObj.symbol);
       var data = JSON.parse(dataObj.data); 
       // console.log("getStockDataByInterval \n " + data.length);
       // getIndicator(dataObj.symbol,data,strategy,true);
    }).catch(error => console.log(error));  
}

function getStock(symbol,interval)
{
    return new Promise((resolve, reject)=>{
        var symbolfile;
        try{      
            symbolfile = path.resolve(path.join(__dirname, '..', 'db/stock/'+interval+'/'+symbol+'.db'));
        }
        catch(e){
            console.log("getStock > Error > " + e);
            reject(e);
        }

        var lokiJson = new loki(symbolfile, 
        {
            autoload: true,
            autoloadCallback : loadHandler,
            autosave: true, 
            autosaveInterval: 10000
        }); 
        
        function loadHandler() {
            var database = lokiJson.getCollection(symbol);
            if(!database){
                database = lokiJson.addCollection(symbol);
            }  
                   
            try{
               // console.log("\n \n  loadHandler > " +symbol +" >> "+ database.get(1));  
                if(database.get(1) && database.get(1).data && database.get(1).data)
                    resolve({"symbol":symbol,data:JSON.stringify(database.get(1).data)}); 
                else
                    resolve({"symbol":symbol,data:[]}); 
            }
            catch(e){
                reject(e);
            }   
        } 
    }); 
}