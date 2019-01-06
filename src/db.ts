const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db/upstox.db', (err) => {
if (err) {
    return console.error(err.message);
}
console.log('Connected to the in-memory SQlite database.');
});

function closeDb(){
    db.close();
}

function insertDB(query,param){
    return new Promise(function(resolve, reject) {
        db.run(query, param,function(err){
            console.log("Insert error > " + err);
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