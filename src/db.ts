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

function insertDB(query){
    db.run(query, (err, row) => {
        // process the row here 
    });
}

function getData(sql,params){
    db.get(sql, params, (err, row) => {
        // process the row here 
    });
}