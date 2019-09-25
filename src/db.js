var chalk = require('chalk');
var async = require("async");
require('technicalindicators');


function getStockDataFromDb(symbol,interval)
{
    //console.log("getStockDataFromDb  " + symbol +" ::"+ interval);
    return new Promise((resolve, reject)=>{
        var symbolfile;
        try{      
            symbolfile = path.resolve(path.join(__dirname, '..', 'db/stock/'+symbol+'.json'));
        }
        catch(e){
            //console.log("getStockDataFromDb > Error > " + e);
            reject(e);
            e = null;
        }
        var lokiJson = new loki(symbolfile, 
        {
            autoload: true,
            autoloadCallback : onLoaded,
            autosave: true, 
            autosaveInterval: 4000
        }); 
        
        function onLoaded() {
            var database = lokiJson.getCollection(interval);
            var stockData = [];
            try{
                 
                if(database && database.get(1) && database.get(1).OHLC != null){
                    var stockDataList = database.get(1).OHLC;
                    resolve({"symbol":symbol,data:JSON.stringify(stockDataList)});
                    lokiJson.close();  
                    stockDataList = database = null;
                    return;
                }
                else{
                    //console.log("DB " + database.get(1).OHLC);
                    resolve({"symbol":symbol,data:[]});
                    lokiJson.close();  
                    database = null;
                    return;
               }

                lokiJson.close();  
                database = null;
            }
            catch(e){
                console.log("getStockDataFromDb > Error > " + interval +"::"+e);
                lokiJson.close();
                reject(e);
                database =e = null;
            }   
        } 
    }); 
}

var queue = async.queue(function(task, callback) {
    var allIntervalsArr = ['15MINUTE','5MINUTE','60MINUTE','30MINUTE'];
    //console.log("task " +task.symbol);
    if(task.symbol){
        var symbolfile;
        try{      
            symbolfile = path.resolve(path.join(__dirname, '..', 'db/stock/'+task.symbol+'.json'));
        }
        catch(e){
            console.log("symbolfile Error > " + e);
        }

        var lokiJson = new loki(symbolfile, 
        {
            autoload: true,
            autoloadCallback : loadHandler,
            autosave: true, 
            unique: 'name',
            autosaveInterval: 10000
        }); 
        
        function loadHandler() {
            var database = lokiJson.getCollection(task.interval);
            if(!database){
                database = lokiJson.addCollection(task.interval,{unique: ['LASTTRADETIME']});
            }  
            var stockData = {};

            if(task.ex == null || task.ex == undefined || task.ex == '')
                task.ex = "NSE_EQ";
            //console.log('\n loadSymbol   ' +task.interval+"> "+ task.symbol +" :: "+ task.ex);

            loadSymbol(task.symbol,task.ex,task.interval,task.start_date,task.end_date).then(function (response) {
                try {
                    if(response != '' && response != undefined && response != null){
                        stockData = response;//JSON.parse(response);
                        //console.log('\n UPDATE   ' +task.interval+"> "+ task.symbol +" :: "+ JSON.stringify(response));

                        if(response && response.error){
                            lokiJson.close(); 
                        }
                        else if(database != null && database.get(1) && database.get(1).data && database.get(1).data.LASTTRADETIME && database.get(1).data.LASTTRADETIME == response.LASTTRADETIME){
                            console.log('Skip ! Do nothing   ' +task.interval+"> "+ task.symbol);
                        }
                        else if(database != null && response && response.code == 400) {
                           
                           console.log(task.interval+" - "+ task.symbol + " > "+response.status + " : "+response.message);
                           lokiJson.close();    
                          
                        } else if(database != null && response) // && response.code == 200
                        {
                           //console.log(JSON.stringify(stockData))
                            database.clear();
                           /*  var OHLC = [];
                            OHLC = Array(stockData.OHLC);
                            OHLC= OHLC.reverse(); 
                            stockData.OHLC = OHLC; */
                            database.insert(stockData);
                            //OHLC = null;  
                          
                        }
                        else{
                            lokiJson.close();    
                        }
                        lokiJson.saveDatabase();   
                        lokiJson.close(); 
                        
                        callback();         
                    } 
                    else{
                        lokiJson.close();    
                        callback();     
                    }
                    
                    lokiJson = database = symbolfile = task = stockData = response = null;

                } catch (err) {
                    lokiJson.close();    
                    console.log("loadHandler queue : err   > " + err);
                    symbolfile = task = err = null;
                }
            });
        }  
    } 
},20);

function fetchLiveCandle(symbol,ex,interval,start_date,end_date){
    //console.log("fetchLiveCandle - " +symbol +":"+ ex +":"+ interval +":"+ start_date +":"+ end_date);
    return new Promise(function(resolve, reject) {
        var allIntervalsArr = ['15MINUTE','5MINUTE','60MINUTE','30MINUTE'];
       // console.log("symbol " +symbol +" : "+ interval);

        if(symbol){
            var symbolfile;
            try{      
                symbolfile = path.resolve(path.join(__dirname, '..', 'db/stock/'+symbol+'.json'));
            }
            catch(e){
                console.log("symbolfile Error > " + e);
            }

            var lokiJson = new loki(symbolfile, 
            {
                autoload: true,
                autoloadCallback : loadHandler,
                autosave: true, 
                unique: 'name',
                autosaveInterval: 10000
            }); 
            
            function loadHandler() {
                var database = lokiJson.getCollection(interval);
                if(!database){
                    database = lokiJson.addCollection(interval,{unique: ['LASTTRADETIME']});
                }  
                var stockData = {};

                if(ex == null || ex == undefined || ex == '')
                    ex = "NSE_EQ";
                //console.log('\n loadSymbol   ' +task.interval+"> "+ task.symbol +" :: "+ task.ex);

                loadSymbol(symbol,ex,interval,start_date,end_date).then(function (response) {
                    try {
                        //console.log('\n loadSymbol   ' +interval+"> "+ symbol +" > "+ interval +" :: "+ JSON.stringify(response));
                        if(response != '' && response != undefined && response != null){
                            stockData = response;//JSON.parse(response);
                            

                            if(response && response.error){
                                lokiJson.close(); 
                            }
                            else if(database != null && database.get(1) && database.get(1).data && database.get(1).data.LASTTRADETIME && database.get(1).data.LASTTRADETIME == response.LASTTRADETIME){
                                console.log('Skip ! Do nothing   ' +interval+"> "+ symbol);
                            }
                            else if(database != null && response && response.code == 400) {
                                console.log(interval+" - "+ symbol + " > "+response.status + " : "+response.message);
                                lokiJson.close();    
                            }
                            else if(database != null && response) // && response.code == 200
                            {
                                //console.log(JSON.stringify(stockData))
                                database.clear();
                                /*var OHLC = [];
                                OHLC = Array(stockData.OHLC);
                                OHLC= OHLC.reverse(); 
                                stockData.OHLC = OHLC; */
                                database.insert(stockData);
                                //OHLC = null;  
                            
                            }
                            else{
                                lokiJson.close();    
                            }
                            lokiJson.saveDatabase();   
                            lokiJson.close(); 
                            
                            resolve(stockData);
                        } 
                        else{
                            lokiJson.close();    
                            resolve([]); 
                        }
                        
                        lokiJson = database = symbolfile =  stockData = response = null;

                    } catch (err) {
                        lokiJson.close();    
                        resolve([]); 
                        console.log("loadHandler queue : err   > " + err);
                        symbolfile = err = null;
                    }
                });
            }  
        }
    });
}

function updateCollection(lokiJson,interval,stockData)
{
    return new Promise(function(resolve, reject) {
            var intervalNo = parseInt(interval);
            var now = new Date();
            var database = lokiJson.getCollection(interval);
            try{
                if(database && database.get(1) && database.get(1).data && database.get(1).data.LASTTRADETIME && database.get(1).data.LASTTRADETIME === response.LASTTRADETIME){
                    console.log('Do nothing   ' +interval);
                }
                else if(database && database.get(1) && database.get(1).data){

                    var symbolObj= {};
                    var count = 0;
                    var t = (database.get(1).data && database.get(1).data[database.get(1).data.length - 1] && database.get(1).data[database.get(1).data.length - 1].LASTTRADETIME) ? database.get(1).data[database.get(1).data.length - 1].LASTTRADETIME : 0;
                    var lows = [];
                    var highs = [];
                  
                    for(var i = 0; i < stockData.length;i++)
                    {
                        if(stockData[i].LASTTRADETIME > t)
                        {
                            var d1 = new Date(stockData[i].LASTTRADETIME);
                            var d2 = new Date(t);
                            
                            if(count % intervalNo == 0 && is15MinDataSync){
                                symbolObj = stockData[i];
                                database.get(1).data.push(stockData[i]);
                                count = 0;
                            }     
                            if(database.get(1).data[database.get(1).data.length - 1].OPEN < 0){
                                database.get(1).data[database.get(1).data.length - 1].OPEN = Number(stockData[i].OPEN); 
                            }
                            database.get(1).data[database.get(1).data.length - 1].CLOSE = Number(stockData[i].CLOSE);
                            database.get(1).data[database.get(1).data.length - 1].LOW = Math.min((stockData[i] && Number(stockData[i].LOW)) ? Number(stockData[i].LOW) : Number(symbolObj.LOW,symbolObj.LOW));
                            database.get(1).data[database.get(1).data.length - 1].HIGH = Math.max((stockData[i] && Number(stockData[i].HIGH)) ? Number(stockData[i].HIGH) : Number(symbolObj.HIGH,symbolObj.HIGH));
                            count++;   
                        }
                    }
                    t = count =  null;
            }
            resolve(1); 
            }
            catch(e){
                reject(e);
                e = null;
            } 
     });
}
// assign a callback
queue.drain = function() {
   // console.log('all items have been processed');
};

var stockJSON = {};
function backFill(lokiJson,stockData,interval)
{
   // console.log("interval  " + interval);
    return new Promise(function(resolve, reject) {
            var intervalNo = parseInt(interval);
            
            var database = lokiJson.getCollection(interval);
            stockJSON =  database.get(1).data;
            try{
            
                if(stockJSON){
                    var symbolObj= {};
                    var count = 0;
                   // console.log(' stockJSON   ' +stockJSON.length);
                    //stockJSON = stockJSON.slice(0, stockJSON.length - 3);
                 
                    var t = (stockJSON[stockJSON.length - 1] && stockJSON[stockJSON.length - 1].LASTTRADETIME) ? stockJSON[stockJSON.length - 1].LASTTRADETIME : 0;
                    var lows = [];
                    var highs = [];
                    var d1 = new Date(Number(t));
               
                        if(stockData && stockData.length > 0){
                            
                            for(var i = stockData.length - (intervalNo * 4); i < stockData.length;i++)
                            {
                                if(stockData[i].LASTTRADETIME >t)
                                {
                                    //console.log(' Stamp >   ' +i +":: "+intervalNo +" :: "+count +" :    "+new Date(Number(stockData[i].LASTTRADETIME)));
                                    if(count % intervalNo  == 0){
                                        if(i + intervalNo - 1 < stockData.length - 1 && !isDuplicate(stockJSON,stockData[i + intervalNo - 1].LASTTRADETIME)){
                                            i = i + intervalNo - 1;
                                            symbolObj = stockData[i];
                                            stockJSON.push(stockData[i]);
                                        }
                                        count = 0;
                                    } 
                                    else{    
                                        stockJSON[stockJSON.length - 1].CLOSE = Number(stockData[i].CLOSE);
                                        stockJSON[stockJSON.length - 1].LOW = Math.min((stockData[i] && Number(stockData[i].LOW)) ? Number(stockData[i].LOW) : Number(symbolObj.LOW,symbolObj.LOW));
                                        stockJSON[stockJSON.length - 1].HIGH = Math.max((stockData[i] && Number(stockData[i].HIGH)) ? Number(stockData[i].HIGH) : Number(symbolObj.HIGH,symbolObj.HIGH));
                                    }
                                    count++;   
                                }
                            }
                    } 
                    symbolObj = lows = highs =  t = count =  null;
            }
            database = null;
            stockData = null;
            resolve(stockJSON); 
            stockJSON = null;
            
            }
            catch(e){
                reject(e);
                e = null;
            } 
     });
}

function isDuplicate(arr,value)
{
    var flag = arr.find(a=>a.LASTTRADETIME == value);
    return flag;
}
