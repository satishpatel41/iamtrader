var fs = require('fs');
var path = require('path');
var loki  = require( 'lokijs' );
var intervalsArr = ['1MONTH','1WEEK','1DAY','60MINUTE','30MINUTE','15MINUTE','10MINUTE','5MINUTE'];
var database;

var queue = async.queue(function(task, callback) {
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
            return loadSymbol(task.symbol,task.ex,task.interval,task.start_date,task.end_date).then(function (response) {
                try {
                        if(response != '' && response != undefined && response != null){
                            stockData = response;
                            if(response.error){
                                console.log('Queue error ' + task.symbol +" :: "+task.ex +" :: "+JSON.stringify(response.error));
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

//syncLiveAllStockData(store.get('nseSymbolList')); 
//syncLiveStockDataByInterval(store.get('nseSymbolList'),'5MINUTE'); 
//getStockDataByInterval('BATAINDIA','1DAY',strategy_rsi60);
//getAllStockDataByInterval(store.get('niftyList'),'1DAY',strategy_rsi60);
//getAllStockDataByInterval(['ULTRACEMCO','ENGINERSIN','DRREDDY','HINDALCO','LT','MINDTREE','PCJEWELLER'],'1DAY',strategy_rsi60);
//getAllStockDataByInterval(['ULTRACEMCO','VEDL','SBIN'],'1DAY');
//getAllData();
/* getAllStockDataByInterval(store.get('fnoList').sort(),'1DAY',strategy_rsi60_crossed);
getAllStockDataByInterval(store.get('fnoList').sort(),'1DAY',strategy_rsi40_crossed);

//getAllStockDataByInterval(['ULTRACEMCO','ENGINERSIN','DRREDDY','HINDALCO','LT','MINDTREE','PCJEWELLER'],'1DAY',strategy_bbUpper_band_crossed);
getAllStockDataByInterval(store.get('fnoList').sort(),'1DAY',strategy_bbLower); */

//getAllStockDataByInterval(store.get('fnoList').sort(),'15MINUTE',strategy_rsi60_crossed);

/* getAllStockDataByInterval(store.get('fnoList').sort(),'15MINUTE',strategy_rsi40_crossed);

getAllStockDataByInterval(store.get('fnoList').sort(),'15MINUTE',strategy_bbLower);

getPercent_list(store.get('fnoList').sort()); */

getAllStockDataByInterval(store.get('fnoList').sort(),'15MINUTE',strategy_bbLower); 
getAllStockDataByInterval(store.get('fnoList').sort(),'15MINUTE',strategy_rsi60_crossed); 
getAllStockDataByInterval(store.get('fnoList').sort(),'15MINUTE',strategy_bbUpper_band_crossed); 
getAllStockDataByInterval(store.get('fnoList').sort(),'15MINUTE',strategy_bbLower); 
/* getAllStockDataByInterval(store.get('fnoList').sort(),'1DAY',strategy_rsi60_crossed); 
 */
async function syncLiveAllStockData(list,interval,start_date,end_date){ 
    list.map(async (x) =>  {
        var symbol = x.symbol ? x.symbol:x;        
        var ex = x.ex;        
        queue.push({symbol: symbol,ex : ex,interval:interval,start_date:start_date,end_date:end_date}, function (err) {
            //  console.log('SyncLiveAllStockData : Finished Queue  - ' + interval);
        });
    });        
}

//Sync Upstox data on first load
async function syncAllUpstoxData(list){ 
    intervalsArr.map(async (interval) =>  {
        console.log('syncAllUpstoxData : Finished Queue  - ' + interval);
        list.map(async (x) =>  {
            var symbol = x.symbol ? x.symbol:x;        
            var ex = x.ex;        
            queue.push({symbol: symbol,ex : ex,interval:interval,start_date:start_date,end_date:end_date}, function (err) {
              //  console.log('SyncLiveAllStockData : Finished Queue  - ' + interval);
            });
        }); 
    });          
}

//Sync Upstox data on by Interval, eg 15 min sync
async function getAllStockDataByInterval(list,interval,strategy){ 
   // console.log("* getAllStockDataByInterval   >> "+list.length);
        var matchSymbols = [];
        Promise.all(list.map(async (x) =>  {
        var symbol = x.symbol ? x.symbol:x;    
        return getStock(symbol,interval);          
        })).then(stockData => {
            var arr = stockData.map(async (dataObj) =>  {
                try{
                    var data = JSON.parse(dataObj.data); 
                    await executeStrategy(dataObj.symbol,data,strategy).then(finalResult => { 
                        var finalResultFlag = finalResult.every(x => x == true);
                        if(finalResultFlag){
                            matchSymbols.push(dataObj.symbol);
                            //console.log("Strategy RESULT  > " + finalResult +"::"+   strategy.name +"::"+ dataObj.symbol +" > "+ matchSymbols.length);
                         }
                        //closes =  opens =  highs = lows = timestamps = finalResult=  strategyObj = null;
                    }).catch(error => 
                    {
                        console.log("OUTER LOOP ERROR > " + error)
                    });
                }
                catch(e){
                    console.log("Error " + e);
                }
            });       
            
            Promise.all(arr)
            .then(a=>
            {
                console.log("RESULT  > " +strategy.name +" >> "+ matchSymbols);

                if(process.env.NODE_ENV=="production")
                {
                    sendingMail("satish.patel41@gmail.com",strategy.name,matchSymbols); 
                }

                //sendingMail("satish.patel41@gmail.com",strategy.name,matchSymbols); 
            })
            .catch();
                       
        })
        .catch(error => { 
            console.log(error)
        }); 
}

//Get Percentage change 
async function getPercent_list(list){ 
    console.log("getPercent_list  % " + list.length);
    var intervalsArr = ['1DAY','15MINUTE'];
    Promise.all(intervalsArr.map(async (interval) => {  
        return new Promise(function(resolved, rejected) {           
            Promise.all(list.map(async (x) =>  {
                var symbol = x.symbol ? x.symbol:x;    
                return getStock(symbol,interval);          
            })).then(stockData => {
                resolved(stockData);
            })
            .catch(error => { 
                console.log(error)
            }); 
        })
        })).then(dataArr => {
                var percentageChangeArray = [];
                for(var i = 0; i < dataArr[0].length;i++){
                    try{
                        var dataObj1 = dataArr[0][i];
                        var dataObj2 = dataArr[1][i];
                        if(dataObj1.symbol == dataObj2.symbol)
                        {
                            var stock1 = [];
                            stock1 = JSON.parse(dataObj1.data);
                            stock1.reverse();
                            var stock2 = [];
                            stock2 = JSON.parse(dataObj2.data);
                            stock2.reverse();
                            var perc = getPercentageChange(stock1[0].close,stock2[0].close);
                            var percObj = {};
                            percObj.symbol = dataObj1.symbol;
                            percObj.percentage = perc;
                            percentageChangeArray.push(percObj);
                            //console.log(dataObj1.symbol +" : "+ perc);
                            stock1 =  stock2 =  null;
                        }
                    }
                    catch(error){ 
                        console.log("Parsing error " +dataObj1.symbol +" : "+ error);
                    }
                }
                percentageChangeArray.sort(function(a, b){return a.percentage - b.percentage});
                percentageChangeArray.reverse();
                store.set("percentage",percentageChangeArray);
                
            dataArr =  null;
        })
        .catch(error => { 
            console.log(error)
        }); 
}

//Get Indicators 
async function getDefaultIndicatorsValues(list,interval){ 
// console.log("* getAllStockDataByInterval   >> "+list.length);
        var matchSymbols = [];
        Promise.all(list.map(async (x) =>  {
        var symbol = x.symbol ? x.symbol:x;    
        return getStock(symbol,interval);          
        })).then(stockData => {
            var arr = stockData.map(async (dataObj) =>  {
                try{
                    var data = JSON.parse(dataObj.data); 
                    
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

//backTesting("SBIN","1DAY",strategy_bbUpper_band_crossed,true);
//backTesting
async function backTesting(symbol,interval,strategy,isbackTesting){ 
    var matchDates = [];
    return new Promise(function(resolved, rejected) {           
        var arr =  getStock(symbol,interval); 
        resolved(arr);  
    }).then(stockData => {
            try{
                var data = JSON.parse(stockData.data); 
                startBackTesting(symbol,data,strategy,isbackTesting).then(finalResult => { 
                for(var i=0; i < finalResult[1].length;i++){
                    var finalResultFlag = finalResult[0][i].every(x => x.flag == true);
                  
                    if(finalResultFlag){
                        matchDates.push(finalResult[1][i][0].date);
                       // console.log("\n > " +JSON.stringify(finalResult[0][i]));
                       // console.log("\n backTesting RESULT  > " +strategy.name +"::"+ stockData.symbol +" > "+ matchDates);
                    }
                }  
                
                console.log("\n backTesting RESULT  > " +strategy.name +"::"+ stockData.symbol +" > "+ matchDates);
            }).catch(error => 
            {
                console.log("OUTER LOOP ERROR > " + error)
            });
        }
        catch(e){
            console.log("Error " + e);
        }             
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