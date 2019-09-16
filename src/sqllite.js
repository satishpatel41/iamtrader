/* const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/upstox.db', (err) => {
if (err) {
    return console.error(err.message);
} */

var db = require('mysql');

var con = db.createConnection({
    host: '13.235.38.97',
    user: 'root',
    password: 'p@ss123!',
    database: 'Satish'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  getAllUsers();
});


async function closeDb(){
    db.close();
}

async function insertDB(query,param){
    //console.log(query +" : "+param);
    return new Promise(function(resolve, reject) {
        
        con.query(query, param,function(err){
            if(err)
                console.log(chalk.red("Insert error > " + err +" \n "+ query));
            else{
                //console.log(chalk.blue("Successfully inserted"));
                resolve("success");
            }               
        });
    })        
}

async function updateDB(query,param){
    return new Promise(function(resolve, reject) {
        //console.log(chalk.red("Update  > " + query +" \n "+ param));
       con.query(query, param,function(err){
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
        //query +" : "+params);
        con.query(query, params, function(err, row){  
            if(err) reject("Read error: " + err.message);
            else {
                //console.log(JSON.stringify(row));
                resolve(row);
            }
        })    
    })    
}

async function getAll(query,params){
    return new Promise(function(resolve, reject) {
        //console.log(query +" : "+params);
        con.query(query, params, function(err, row){  
            if(err) reject("Read error: " + err.message);
            else {
               resolve(row);
              // console.log(JSON.stringify(row));
               return row;
            }
        })    
    })    
}
var strategyList = [];
getAllLiveStrategy();
async function getAllLiveStrategy()
{
    //strategyList = [];
    var tempList = [];
    var query = "SELECT * from applyStrategy";
    var param = [];
    //console.log(query +" : "+params);
    getAll(query,param).then(list => {
        //console.log("getAllLiveStrategy > " + list.length);
        if(list == undefined)
        {
            console.log("\n Error to getAllLiveStrategy");
        }
        else{
            list.map(async(obj)=>{
                var query = "SELECT * from Indicators where sid=?;";
                var param = [obj.sid];
                getAll(query,param).then(indicators => {
                    if(indicators == undefined)
                    {
                        console.log("\n Error to getAllLiveStrategy");
                    }
                    else{
                        obj['indicators'] = indicators;    
                    }
                });

                var query = "SELECT name,description,category,isPrivate FROM Strategy where sid=?";
                var param = [obj.sid];
                getAll(query,param).then(strategy => {
                    //console.log("\n strategy > " + strategy.length);

                    if(strategy == undefined)
                    {
                        console.log("\n Error to Strategy");
                    }
                    else{
                        for (let [key, value] of Object.entries(strategy[0])) {
                            obj[key] = value;     
                        } 
                    }
                    tempList.push(obj);
                    if(tempList.length > 0 && tempList.length == list.length){
                        strategyList = tempList;
                        //getLiveSymbol();
                    }
                    //console.log("Final result > " + JSON.stringify(strategyList));   
                });
            });
           
        }
    }); 
}

getLiveSymbol();

async function getLiveSymbol()
{
    var query = "SELECT * from applyStrategy";
    var param = [];
    //console.log(query +" : "+params);
    await getAll(query,param).then(list => {
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