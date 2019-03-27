const csv = require('csv-parser')
var fs = require('fs')
var nifty = "https://www.nseindia.com/content/indices/ind_nifty50list.csv";
var fno = "https://www.nseindia.com/content/fo/fo_mktlots.csv";
var watchList = [];
const results = [];
var fnoList = [];
var niftyList =  [];
fs.createReadStream('data/list/ind_nifty50list.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {  
    results.forEach(function(item) { 
        if(item.Symbol){
            niftyList.push({ex:"NSE_EQ", symbol:item.Symbol});
        }    
    });
    watchList =  niftyList.sort();
    store.set('niftyList',niftyList);
    watchList =  niftyList.sort(); 
  });


/* var res = [];
  fs.createReadStream('data/list/fo_mktlots.csv')
  .pipe(csv())
  .on('data', (data) => res.push(data))
  .on('end', () => {
    
    res.forEach(function(item) {   
        console.log(" NSE_FO :: "  +item); 
        if(item.SYMBOL    ){
            // console.log(" NSE_FO :: "  +item.SYMBOL)
             fnoList.push({ex:"NSE_EQ", symbol:item.SYMBOL});
         }
    });

    console.log(" fnoList :: "  +fnoList.length);  

  }); */