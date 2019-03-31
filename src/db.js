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
    return new Promise((resolve, reject)=>{
        var symbolfile;
        try{      
            symbolfile = path.resolve(path.join(__dirname, '..', 'db/stock/'+interval+'/'+symbol+'.db'));
        }
        catch(e){
            console.log("getStockDataFromDb > Error > " + e);
            reject(e);
            e = null;
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


                lokiJson.close();    
            }
            catch(e){
                lokiJson.close();
                reject(e);
                e = null;
            }   
        } 
    }); 
}



var queue = async.queue(function(task, callback) {
   
    if(task.symbol){
        var symbolfile;
        try{      
            symbolfile = path.resolve(path.join(__dirname, '..', 'db/stock/'+task.interval+'/'+task.symbol+'.db'));
        }
        catch(e){
            console.log("symbolfile Error > " + e);
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

            if(task.ex == null || task.ex == undefined || task.ex == '')
                task.ex = "NSE_EQ";
            
            loadSymbol(task.symbol,task.ex,task.interval,task.start_date,task.end_date).then(function (response) {
                try {
                        if(response != '' && response != undefined && response != null){
                            stockData = response;
                           /*  if(response.error){
                                database.clear();
                                lokiJson.close(); 
                                //callback();         
                                console.log('Queue error ' + task.symbol +" :: "+task.ex +" :: "+JSON.stringify(response.error));
                            }
                            else  */
                            if(database.get(1) && database.get(1).data && database.get(1).data.timestamp && database.get(1).data.timestamp === response.timestamp){
                                console.log('Do nothing   ' +task.interval+"> "+ task.symbol);
                            }
                            else{
                               // console.log('UPDATE   ' +task.interval+"> "+ task.symbol);
                                database.clear();
                                database.insert(stockData);      
                            }
                            lokiJson.saveDatabase();   
                            lokiJson.close(); 
                            callback();         
                        } 
                        else{
                            lokiJson.close();    
                            callback();     
                        }
                      
                        symbolfile = task = stockData = response = null;
                    
                  } catch (err) {
                    lokiJson.close();    
                    console.log("loadHandler queue : err   > " + err);
                    symbolfile = task = err = null;
                    callback();    
                    //return err;
                  }
            });
        }  
    } 
},10);