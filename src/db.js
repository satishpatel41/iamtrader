var chalk = require('chalk');
var async = require("async");
require('technicalindicators');
//import { CandleData, CandleList } from '../StockData';
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db/upstox.db', (err) => {
if (err) {
    return console.error(err.message);
}
console.log(chalk.green('Connected to tSuccessfully insertedhe in-memory SQlite database.'));
});

function closeDb(){
    db.close();
}

function insertDB(query,param){
    return new Promise(function(resolve, reject) {
        db.run(query, param,function(err){
            if(err)
                console.log(chalk.red("Insert error > " + err +" \n "+ query));
            else{
                //console.log(chalk.blue("Successfully inserted"));
                resolve("success");
            }               
        });
    })        
}

function updateDB(query,param){
    return new Promise(function(resolve, reject) {
       // console.log(chalk.red("Update  > " + query +" \n "+ param));
        db.run(query, param,function(err){
            if(err)
                console.log(chalk.red("Update error > " + err +" \n "+ query));
            else{
                //console.log(chalk.blue("Successfully Updated"));
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

async function getAll(query,params){
    return new Promise(function(resolve, reject) {
        //console.log(query +" : "+params);
        db.all(query, params, function(err, row){  
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
            //var database1 =  lokiJson.getCollection('1MINUTE');
            var database = lokiJson.getCollection(interval);
            var stockData = [];
            try{
                 
                if(database && database.get(1) && database.get(1).OHLC != null){
                    
                    var stockDataList = database.get(1).OHLC;
                   /*  stockData = stockDataList.map(price=>{
                        var candle = new CandleData(price.OPEN,price.LOW,price.HIGH,price.CLOSE,price.LASTTRADETIME,price.TRADEDQTY,true)
                        return candle;
                    }); */

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

                
                /* if(result && result != "" && database != null && interval !='1MINUTE'){
                    //lokiJson.saveDatabase();       
                    backFill(lokiJson,stockData,interval)
                    .then(data =>{
                        console.log("Third  " + data.length);
                        resolve({"symbol":symbol,data:JSON.stringify(data)});
                    });
                }
                if(result && result != "" && database != null ){
                        resolve({"symbol":symbol,data:JSON.stringify(data)});
                }
                else
                    resolve({"symbol":symbol,data:[]}); 
 */
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
getLiveSymbol();
getAllLiveStrategy();


function getLiveSymbol()
{
    var query = "SELECT * from applyStrategy";
    var param = [];
    getAll(query,param).then(list => {
        //console.log("result > " + JSON.stringify(list));
        if(list == undefined)
        {
            console.log("\n Error to getLiveSymbol");
        }
        else{
            //console.log("\n getLiveSymbol result > " + JSON.stringify(list));
            watchList = list;
        }
    });  
}

var strategyList = [];
async function getAllLiveStrategy()
{
    strategyList = [];

    var query = "SELECT * from applyStrategy";
    var param = [];
    getAll(query,param).then(list => {
        //console.log("\n getAllLiveStrategy > " + list.length);
        if(list == undefined)
        {
            console.log("\n Error to getLiveSymbol");
        }
        else{
            var i = 0;
            list.map(async(obj)=>{
                //strategyList.push(obj);
                var query = "SELECT * from Indicators where sid=?;";
                var param = [obj.sid];
                getAll(query,param).then(indicators => {
                    if(indicators == undefined)
                    {
                        console.log("\n Error to getAllLiveStrategy");
                    }
                    else{
                        //console.log("\n\n  > " + JSON.stringify(strategyList[i]['indicators']));
                        //strategyList[i]['indicators'] = indicators;   
                        obj['indicators'] = indicators;                          
                    }
                });

                var query = "SELECT name,description,category,isPrivate FROM Strategy where sid=?";
                var param = [obj.sid];
                getAll(query,param).then(strategy => {
                    if(strategy == undefined)
                    {
                        console.log("\n Error to Strategy");
                    }
                    else{
                        //console.log("\n\n strategy > " + JSON.stringify(strategy));
                        for (let [key, value] of Object.entries(strategy[0])) {
                            //console.log(`${key}: ${value}`);
                            //strategyList[i][key] = value; 
                            obj[key] = value;     
                        } 
                        // strategyList[i]['indicators'] = indicators;
                    }
                    //i++;
                    strategyList.push(obj);
                    // console.log("\n\n Final result > " + JSON.stringify(strategyList));
                });
            });  
            //console.log("\nstrategyList > " + strategyList.length);
        }

        
    });  
}