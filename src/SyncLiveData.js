var fs = require('fs');
var path = require('path');

var loki  = require( 'lokijs' );
var intervalsArr =['1MINUTE','15MINUTE','1DAY'];
var allIntervalsArr = ['15MINUTE','5MINUTE','1DAY','60MINUTE','30MINUTE','1MONTH','1WEEK'];

var database;

async function syncLiveAllStockData(list,interval,start_date,end_date){ 
    console.log('syncLiveAllStockData  - ' + interval +" : "+list.length);
    list.map(async (x) =>  {
        var symbol = x.symbol ? x.symbol:x;        
        var ex = x.exchange;      
        //console.log('syncLiveAllStockData : Finished Queue  - ' + symbol +" :: "+ interval +" :: "+ ex);
        queue.push({symbol: symbol,ex:ex,interval:interval,start_date:start_date,end_date:end_date}, function (err) {
            //console.log('syncLiveAllStockData : Finished Queue  - ' + interval);
        });
        x = symbol = ex= null;
    });        
}

//Sync Upstox data on first load
async function syncAllUpstoxData(list){ 
    var now= new Date();
    var india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata"); 
    var intervals = allIntervalsArr; 
   /*  if(india.day() == 0 || india.day() == 6 || india.hour() >= 18 || india.hour() <= 9)
    {
        intervals = allIntervalsArr;
    }
 */
    await intervals.map(async (interval) =>  {
        //console.log('syncAllUpstoxData :  interval  - ' + interval);
        await list.map(async (x) =>  {
            var symbol = x.symbol ? x.symbol:x;        
            var ex = x.exchange;      
            
            var now = new Date();
            var india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata"); 
            var end_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();
            if(interval == '1MONTH')
                now.setMonth(now.getMonth() - 90);
            else if(interval == '1WEEK')
                now.setDate(now.getDate() - 150 * 7);
            else if(interval == '1DAY')
                now.setDate(now.getDate() - 400);    
            else if(interval == '30MINUTE')
                now.setDate(now.getDate() - 6);
            else if(interval == '60MINUTE')
                now.setDate(now.getDate() - 6);    
            else if(interval == '15MINUTE')
                now.setDate(now.getDate() - 6);
            else if(interval == '5MINUTE' || interval == '3MINUTE')
                now.setDate(now.getDate() - 2);
            else if(interval == '1MINUTE')
                 now.setDate(now.getDate());
            else
                now.setDate(now.getDate() - 6);

            india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
            india.format(); 
            var start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();
           
            //console.log('Queue  - ' + symbol +" :: "+ interval +" :: "+ start_date);

            await queue.push({symbol:symbol,ex:ex,interval:interval,start_date:start_date,end_date:end_date}, function (err) {
                //console.log('syncAllUpstoxData : Finished Queue  - ' + symbol +" : "+interval);  
            });
        }); 
    });          
}

//Get Percentage change 
async function getPercent_list(list){ 
    var now = new Date();
    var india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata"); 
    var time = india.hour() +":"+india.minute();

    //console.log("getPercent_list  - time : " + time);
    var intervalsArr = ['1DAY','5MINUTE'];
    Promise.all(intervalsArr.map(async (interval) => {  
        return new Promise(function(resolved, rejected) {           
            Promise.all(list.map(async (x) =>  {
                return getStockDataFromDb(x.symbol ? x.symbol:x,interval);          
            })).then(stockData => {
                //console.log("percentage : " + interval +"::"+stockData.length);
                resolved(stockData);
            })
            .catch(error => { 
                console.log(error)
            }); 
        })
    })).then(dataArr => {
            var percentageChangeArray = [];
            var configChangeArray =  store.get("percentage");
           
            for(var i = 0; i < dataArr[0].length;i++){
                try{
                    var dataObj1 = dataArr[0][i];
                    var dataObj2 = dataArr[1][i];

                    if(dataObj1.symbol == dataObj2.symbol)
                    {
                        var percObj = {};
                        for(var id = 0; id < configChangeArray.length;id++){
                            try{
                                if(configChangeArray[i].symbol == dataObj2.symbol)
                                {
                                    percObj = configChangeArray[id];
                                    break;
                                }
                            }
                            catch(error){ 
                                //console.log("percentage error  : " + error);
                            }
                        } 
                        var stock1 = [];
                        stock1 = JSON.parse(dataObj1.data);
                        stock1.reverse();
                        var stock2 = [];
                        stock2 = JSON.parse(dataObj2.data);
                        

                        var lows = [];
                        var highs = [];
                      
                        for(var j = 0; j < stock2.length;j++){
                            var d = new Date(Number(stock2[j].LASTTRADETIME));
                            if(d.getDate() == now.getDate()){
                                break;
                            }
                        }

                        stock2 = stock2.slice(j, stock2.length);  //**********  dont't change **********  
                        stock2.reverse();
                        for(var k = 0; k < stock2.length;k++){
                            lows.push(stock2[k].LOW);
                            highs.push(stock2[k].HIGH);
                        }

                        var perc = getPercentageChange(stock1[0].CLOSE,stock2[0].CLOSE);
                        percObj.symbol = dataObj1.symbol;
                        percObj.percentage = perc;
                        var india = moment.tz(new Date(Number(stock2[0].LASTTRADETIME)), "Asia/Kolkata");
                        india.format(); 
                        percObj.LASTTRADETIME = india.date() +"/"+(india.month()+1) +"/"+india.year()+" "+india.hour()+":"+india.minute();//new Date(row.LASTTRADETIME);
                        percObj.prevClose = Number(stock1[0].CLOSE);
                        percObj.LOW = Math.min(...LOWs);
                        percObj.HIGH = Math.max(...HIGHs);
                        percObj.CLOSE = Number(stock2[0].CLOSE);
                        percObj.OPEN = Number(stock2[stock2.length - 1].OPEN);
                        
                        percentageChangeArray.push(percObj);
                        var india = moment.tz(new Date(Number(stock2[0].LASTTRADETIME)), "Asia/Kolkata");
                        stock1 =  stock2 = lows = highs = perc = percObj = dataObj1 = dataObj2 =india = null;
                    }
                }
                catch(error){ 
                    //console.log("getPercent_list Parsing error " +dataObj1.symbol +" : "+ error);
                    
                }
            }
            percentageChangeArray.sort(function(a, b){return a.percentage - b.percentage});
            percentageChangeArray.reverse();
            store.set("percentage",percentageChangeArray);
            
            percentageChangeArray = dataArr =  intervalsArr = null;
            return 1;
    })
    .catch(error => { 
        console.log(error)
    }); 
}

//Get Gap up / Down
async function getGapUpDown(list){ 
    var now = new Date();
    var india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata"); 
    var time = india.hour() +":"+india.minute();

    console.log("getGapUpDown  - time : " + time);
    var intervalsArr = ['1DAY','5MINUTE'];
    Promise.all(intervalsArr.map(async (interval) => {  
        return new Promise(function(resolved, rejected) {           
            Promise.all(list.map(async (x) =>  {
                return getStockDataFromDb(x.symbol ? x.symbol:x,interval);          
            })).then(stockData => {
                resolved(stockData);
            })
            .catch(error => { 
                console.log(error)
            }); 
        })
    })).then(dataArr => {
            var percentageChangeArray = [];
            var configChangeArray =  store.get("gap");
           
            for(var i = 0; i < dataArr[0].length;i++){
                try{
                    var dataObj1 = dataArr[0][i];
                    var dataObj2 = dataArr[1][i];

                    if(dataObj1.symbol == dataObj2.symbol)
                    {
                        var percObj = {};
                        for(var id = 0; id < configChangeArray.length;id++){
                            try{
                                if(configChangeArray[i].symbol == dataObj2.symbol)
                                {
                                    percObj = configChangeArray[id];
                                    break;
                                }
                            }
                            catch(error){ 
                                //console.log("error  : " + error);
                            }
                        } 
                        var stock1 = [];
                        stock1 = JSON.parse(dataObj1.data);
                        stock1.reverse();
                        var stock2 = [];
                        stock2 = JSON.parse(dataObj2.data);
                        //stock2.reverse();

                        var lows = [];
                        var highs = [];
                        //console.log(stock2.length);

                        for(var j = 0; j < stock2.length;j++){
                            var d = new Date(Number(stock2[j].LASTTRADETIME));
                            //console.log(d.getDate() +"==="+ now.getDate());
                            if(d.getDate() == now.getDate()){
                                break;
                            }
                        }
                        //console.log(j +"==="+ stock2.length);
                        stock2 = stock2.slice(j, stock2.length);  //**********  dont't change **********  
                        stock2.reverse();
                        //console.log(stock2.length);


                        for(var k = 0; k < stock2.length;k++){
                            lows.push(stock2[k].LOW);
                            highs.push(stock2[k].HIGH);
                        }

                        var perc = getPercentageChange(stock1[0].CLOSE,Number(stock2[stock2.length - 1].OPEN));
                        percObj.symbol = dataObj1.symbol;
                        percObj.gap = perc;
                        var india = moment.tz(new Date(Number(stock2[0].LASTTRADETIME)), "Asia/Kolkata");
                        india.format(); 
                        percObj.LASTTRADETIME = india.date() +"/"+(india.month()+1) +"/"+india.year()+" "+india.hour()+":"+india.minute();//new Date(row.LASTTRADETIME);
                        percObj.LOW = Math.min(...LOWs);
                        percObj.HIGH = Math.max(...HIGHs);
                        percObj.prevClose = Number(stock1[0].CLOSE);
                        percObj.CLOSE = Number(stock2[0].CLOSE);
                        percObj.OPEN = Number(stock2[stock2.length - 1].OPEN);
                        
                        percentageChangeArray.push(percObj);
                        var india = moment.tz(new Date(Number(stock2[0].LASTTRADETIME)), "Asia/Kolkata");
                        stock1 =  stock2 = lows = highs = perc = percObj = dataObj1 = dataObj2 =india = null;
                    }
                }
                catch(error){ 
                    //console.log("getGapUpDown Parsing error " +dataObj1.symbol +" : "+ error);
                }
            }
            percentageChangeArray.sort(function(a, b){return a.percentage - b.percentage});
            percentageChangeArray.reverse();
            store.set("gap",percentageChangeArray);
            
            percentageChangeArray = dataArr =  intervalsArr = null;
            return 1;
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
        return getStockDataFromDb(symbol,interval);          
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

//backTesting
async function backTesting(symbol,interval,strategy,isbackTesting){ 
    var matchDates = [];
    return new Promise(function(resolved, rejected) {           
        var arr =  getStockDataFromDb(symbol,interval); 
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
        var ex = x.ex;        
        queue.push({symbol:symbol,ex:ex,interval:interval}, function (err) {
           //console.log('syncLiveStockDataByInterval : Finished Queue' + interval);
        });       
    }); 
}

function getStockDataByInterval(symbol,interval,strategy){ 
    getStockDataFromDb(symbol,interval)
    .then(dataObj  => {
        //console.log("symbol  "+dataObj.symbol);
       var data = JSON.parse(dataObj.data); 
       // console.log("getStockDataByInterval \n " + data.length);
       // (dataObj.symbol,data,strategy,true);
    }).catch(error => console.log(error));  
}

function getBankNifty(symbol,interval,strategy){ 
    getStockDataFromDb(symbol,interval)
    .then(dataObj  => {

        if(dataObj && dataObj.data){
            //console.log("getBankNifty \n " + JSON.stringify(dataObj) );
            var data = JSON.parse(dataObj.data); 
            
                var close = data[data.length - 1].CLOSE;
                var currentPrice = Math.round(close / 100) * 100;
                var pricePattern = new RegExp(String(currentPrice), 'gi');
                data.reverse();
                data.map(row => {
                    var india = moment.tz(new Date(Number(row.LASTTRADETIME)), "Asia/Kolkata");
                    india.format(); 
                    row.LASTTRADETIME = india.date() +"/"+(india.month()+1) +"/"+india.year()+" "+india.hour()+":"+india.minute();
                    row.rsi = rsi.nextValue(Number(row.CLOSE));
                    row.sma = sma.nextValue(Number(row.CLOSE));
                    row.bb = bb.nextValue(Number(row.CLOSE)); 
                    
                    return row;
                });
                data.reverse();

                console.log("getBankNifty \n " + JSON.stringify(data[0]) +":"+currentPrice);
            }

        //checkBankNiftyExpiry(data);
       // getIndicator(dataObj.symbol,data,strategy,true);
    }).catch(error => console.log(error));  
}

async function loadSymbol(symbol,exchange,interval='1day',start_date='',end_date=''){  
    var data ={};
    var candle_data = [];

    if(exchange.toUpperCase() =="NSE_EQ"){
        exchange ="NFO";
        data.instrumentIdentifier = 'FUTSTK_'+symbol+'_25JUL2019_XX_0';
    }else  if(exchange.toUpperCase() =="NFO"){
        data.instrumentIdentifier = symbol;//'FUTSTK_'+symbol+'_25JUL2019_XX_0';
    }else  if(exchange.toUpperCase() =="NSE_INDEX"){
        data.instrumentIdentifier = symbol;//'FUTIDX_'+symbol+'_25JUL2019_XX_0';
    }

    data.exchange = exchange;
    //console.log("\n > " + data.instrumentIdentifier + " > "+JSON.stringify(data));

    if(interval=='3MINUTE')
        candle_data = await GetHistory3Minute(data);
    else if(interval=='5MINUTE')
        candle_data = await GetHistory5Minute(data);
    else if(interval=='15MINUTE')
        candle_data = await GetHistory15Minute(data);
    else if(interval=='30MINUTE')
        candle_data = await GetHistory30Minute(data);
    else if(interval=='60MINUTE')
        candle_data = await GetHistory60Minute(data);
    else if(interval=='1DAY')
        candle_data = await GetHistory1Day(data);
   
    if(candle_data && candle_data.type =='invalid-json'){
        console.log("\n adding queue again > " + symbol + " > "+JSON.stringify(candle_data));
        queue.push({symbol:symbol,ex:exchange,interval:interval}, function (err) {
            //console.log('syncLiveStockDataByInterval : Finished Queue' + interval);
         });  
    }
    else{
        
    }
    return candle_data;
}

function getAllData(){
    var result = 0;
    let promise = new Promise(function(resolve, reject) {
        /* setTimeout(function() {
            var interval = '15MINUTE';
            getBankNifty(bankNiftySymbol,interval,'');
        }, 1300); */

        setTimeout(function() {
            resolve(1);
            syncAllUpstoxData(watchList);
        }, 7000);
   
    }).then(res=>{
        getPercent_list(watchList);
        getGapUpDown(watchList);
        
       /*  strategyStrongList.map(async(strategy)=>{
            applyStrategy(watchList,'15MINUTE',strategy); 
        }); */
        /* rsiList.map(async(strategy)=>{
            applyStrategy(bankNifty_indices,'15MINUTE',strategy); 
        }); */
    });
}