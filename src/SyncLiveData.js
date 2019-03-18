var fs = require('fs');
var path = require('path');
var loki  = require( 'lokijs' );
var intervalsArr = ['1MONTH','1WEEK','1DAY','60MINUTE','30MINUTE','10MINUTE','5MINUTE'];
var database;

var queue = async.queue(function(task, callback) {
    console.log('async.queue    ' +task.interval+"> "+ task.symbol);
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
            var filePath = 'data/stock/'+task.interval+'/'+task.symbol+'.txt';                 
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
            });     
        }  
    } 
}, 5);

var strategy_smaCross = [
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
var strategy_sma200 = [
{
indicators:
[
    {indicator:'SMA',period : 200,values:"closes"}
],output:[],strategy:"closes[0] >= output[0][0]"
}
]; 
var strategy_rsi60 = [
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
],output:[],strategy:"output[0][1] < 60"
} 
]; 
var strategy_bbLower = [
{
indicators:
[
    {indicator:'BB',period : 14,values:"closes"}
],output:[],strategy:"closes[0] >= output[0][0]['lower']"
} 
]; 
var strategy_bbUpper = [
{
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes"}
        ],output:[],strategy:"closes[0] >= output[0][0]['upper']"
    } 
]; 
  
//syncLiveAllStockData(store.get('nseSymbolList')); 
//syncLiveStockDataByInterval(store.get('nseSymbolList'),'5MINUTE'); 
//getStockDataByInterval('BATAINDIA','1DAY',strategy_rsi60);
//getAllStockDataByInterval(store.get('niftyList'),'1DAY',strategy_rsi60);
//getAllStockDataByInterval(['BATAINDIA','VEDL','SBIN'],'1DAY',strategy_rsi60);
//getAllStockDataByInterval(['BATAINDIA','VEDL','SBIN'],'1DAY');
getAllStockDataByInterval(['BATAINDIA','VEDL','SBIN'],'1DAY',strategy_rsi60);

async function syncLiveAllStockData(list){ 
    intervalsArr.map(async (interval) =>  {
        list.map(async (x) =>  {
            var symbol = x.symbol ? x.symbol:x;        
            queue.push({symbol: symbol,interval:interval}, function (err) {
                //console.log('Finished Queue');
            });
            
        }); 
    });          
}

function getAllStockDataByInterval(list,interval,strategy){ 
    console.log("* getAllStockDataByInterval   >> "+list.length);

        Promise.all(list.map(async (x) =>  {
        var symbol = x.symbol ? x.symbol:x;    
        return getStock(symbol,interval);          
        })).then(stockData => {
            console.log("* getAllStockDataByInterval  "+stockData.length);
            stockData.map(async (dataObj) =>  {
                try{
                    var data = JSON.parse(dataObj.data); 
                    getIndicator(dataObj.symbol,data,strategy,false);
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
            //console.log('Finished Queue');
        });       
    }); 
}

function getStockDataByInterval(symbol,interval,strategy){ 
    getStock(symbol,interval)
    .then(dataObj  => {
        //console.log("symbol  "+dataObj.symbol);
        var data = JSON.parse(dataObj.data);
 
        console.log("getStockDataByInterval \n " + data.length);
            
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
               // console.log(" loadHandler > " +symbol +" >> "+ JSON.stringify(database.get(1).data));  
                if(database.get(1) && database.get(1).data)
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