var chalk = require('chalk');
var async = require("async");
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db/upstox.db', (err) => {
if (err) {
    return console.error(err.message);
}
console.log(chalk.green('Connected to the in-memory SQlite database.'));
});

function closeDb(){
    db.close();
}

function insertDB(query,param){
    return new Promise(function(resolve, reject) {
        db.run(query, param,function(err){
            if(err)
                console.log(chalk.red("Insert error > " + err));
            else{
                console.log(chalk.blue("Successfully inserted"));
                resolve("success");
            }               
        });
    })        
}

async function getFirst(query,params){
    return new Promise(function(resolve, reject) {
        db.get(query, params, function(err, row){  
        if(err) reject("Read error: " + err.message);
        else {
            resolve(row);
        }
        })    
    })    
}

function getStockDataFromDb(symbol,interval)
{
    //console.log("getStockDataFromDb  " + symbol +" ::"+ interval);
    return new Promise((resolve, reject)=>{
        var symbolfile;
        try{      
            symbolfile = path.resolve(path.join(__dirname, '..', 'db/stock/'+symbol+'.json'));
        }
        catch(e){
            console.log("getStockDataFromDb > Error > " + e);
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
            var database1 =  lokiJson.getCollection('1MINUTE');
            var database = lokiJson.getCollection(interval);
            var stockData = [];
            try{
                var result = interval.match(/MINUTE/gi);

                if(interval =='1MINUTE'){
                    resolve({"symbol":symbol,data:JSON.stringify(database.get(1).data)});
                    lokiJson.close();  
                    result =database1 = database = null;
                    return;
                }
                else if(result && result != "" && database1 != null && database1.get(1) && database1.get(1).data){
                    stockData = database1.get(1).data;
                }
                else{
                    resolve({"symbol":symbol,data:JSON.stringify(database.get(1).data)});
                    lokiJson.close();  
                    result =database1 = database = null;
                    return;
                }

                
                if(result && result != "" && database != null && interval !='1MINUTE'){
                    //lokiJson.saveDatabase();       
                    backFill(lokiJson,stockData,interval)
                    .then(data =>{
                        //console.log("Third  " + data.length);
                        resolve({"symbol":symbol,data:JSON.stringify(data)});
                    });
                }
                else
                    resolve({"symbol":symbol,data:[]}); 

                lokiJson.close();  
                result =database1 = database = null;
            }
            catch(e){
                console.log("getStockDataFromDb > Error > " + interval +"::"+e);
                lokiJson.close();
                reject(e);
                database1 = database =e = null;
            }   
        } 
    }); 
}

var queue = async.queue(function(task, callback) {
    var allIntervalsArr = ['15MINUTE','5MINUTE','60MINUTE','30MINUTE'];
    
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
                database = lokiJson.addCollection(task.interval,{unique: ['timestamp']});
            }  
            var stockData = [];

            if(task.ex == null || task.ex == undefined || task.ex == '')
                task.ex = "NSE_EQ";
            
            loadSymbol(task.symbol,task.ex,task.interval,task.start_date,task.end_date).then(function (response) {
                try {
                    if(response != '' && response != undefined && response != null){
                        stockData = response;
                        if(response && response.error){
                            lokiJson.close(); 
                        }
                        else if(database != null && database.get(1) && database.get(1).data && database.get(1).data.timestamp && database.get(1).data.timestamp == response.timestamp){
                            console.log('Skip ! Do nothing   ' +task.interval+"> "+ task.symbol);
                        }
                        else if(database != null && response && response.code == 200) {
                            //console.log('UPDATE   ' +task.interval+"> "+ task.symbol +" :: "+ database);
                            database.clear();
                            database.insert(stockData);  
                          
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

function updateCollection(lokiJson,interval,stockData)
{
    return new Promise(function(resolve, reject) {
            var intervalNo = parseInt(interval);
            var now = new Date();
            var database = lokiJson.getCollection(interval);
            try{
                if(database && database.get(1) && database.get(1).data && database.get(1).data.timestamp && database.get(1).data.timestamp === response.timestamp){
                    console.log('Do nothing   ' +interval);
                }
                else if(database && database.get(1) && database.get(1).data){

                    var symbolObj= {};
                    var count = 0;
                    var t = (database.get(1).data && database.get(1).data[database.get(1).data.length - 1] && database.get(1).data[database.get(1).data.length - 1].timestamp) ? database.get(1).data[database.get(1).data.length - 1].timestamp : 0;
                    var lows = [];
                    var highs = [];
                  
                    for(var i = 0; i < stockData.length;i++)
                    {
                        if(stockData[i].timestamp > t)
                        {
                            var d1 = new Date(stockData[i].timestamp);
                            var d2 = new Date(t);
                            
                            if(count % intervalNo == 0 && is15MinDataSync){
                                symbolObj = stockData[i];
                                database.get(1).data.push(stockData[i]);
                                count = 0;
                            }     
                            if(database.get(1).data[database.get(1).data.length - 1].open < 0){
                                database.get(1).data[database.get(1).data.length - 1].open = Number(stockData[i].open); 
                            }
                            database.get(1).data[database.get(1).data.length - 1].close = Number(stockData[i].close);
                            database.get(1).data[database.get(1).data.length - 1].low = Math.min((stockData[i] && Number(stockData[i].low)) ? Number(stockData[i].low) : Number(symbolObj.low,symbolObj.low));
                            database.get(1).data[database.get(1).data.length - 1].high = Math.max((stockData[i] && Number(stockData[i].high)) ? Number(stockData[i].high) : Number(symbolObj.high,symbolObj.high));
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
                 
                    var t = (stockJSON[stockJSON.length - 1] && stockJSON[stockJSON.length - 1].timestamp) ? stockJSON[stockJSON.length - 1].timestamp : 0;
                    var lows = [];
                    var highs = [];
                    var d1 = new Date(Number(t));
               
                        if(stockData && stockData.length > 0){
                            
                            for(var i = stockData.length - (intervalNo * 4); i < stockData.length;i++)
                            {
                                if(stockData[i].timestamp >t)
                                {
                                    //console.log(' Stamp >   ' +i +":: "+intervalNo +" :: "+count +" :    "+new Date(Number(stockData[i].timestamp)));
                                    if(count % intervalNo  == 0){
                                        if(i + intervalNo - 1 < stockData.length - 1 && !isDuplicate(stockJSON,stockData[i + intervalNo - 1].timestamp)){
                                            i = i + intervalNo - 1;
                                            symbolObj = stockData[i];
                                            stockJSON.push(stockData[i]);
                                        }
                                        count = 0;
                                    } 
                                    else{    
                                        stockJSON[stockJSON.length - 1].close = Number(stockData[i].close);
                                        stockJSON[stockJSON.length - 1].low = Math.min((stockData[i] && Number(stockData[i].low)) ? Number(stockData[i].low) : Number(symbolObj.low,symbolObj.low));
                                        stockJSON[stockJSON.length - 1].high = Math.max((stockData[i] && Number(stockData[i].high)) ? Number(stockData[i].high) : Number(symbolObj.high,symbolObj.high));
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
    var flag = arr.find(a=>a.timestamp == value);
    return flag;
}
