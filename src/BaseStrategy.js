var SMA = require('technicalindicators').SMA;
var EMA = require('technicalindicators').EMA;
var RSI = require('technicalindicators').RSI;
var BB = require('technicalindicators').BollingerBands;
var ADL = require('technicalindicators').ADL;
var ADX = require('technicalindicators').ADX;
var ATR = require('technicalindicators').ATR
var MACD = require('technicalindicators').MACD;
var bullish = require('technicalindicators').bullish;
var Lowest  = require('technicalindicators').Lowest;
var Highest = require('technicalindicators').Highest;

var async = require("async");
var allIndicators= [
    {
        "name":"number",
        "input":'0',
        "config":'number'
    },
    {
        "name":"close",
        "input":'',
        "config":'close'
    },
    {
        "name":"low",
        "input":'',
        "config":'low'
    },
    {
        "name":"high",
        "input":'',
        "config":'high'
    },
    {
        "name":"open",
        "input":'',
        "config":'open'
    },
    {
        "name":"volume",
        "input":'',
        "config":'volume'
    },
    {
        "name":"ATR",
        "input":'high,low,close,14',
        "config":'high,low,close,period'
    },
    {
        "name":"BB.upper",
        "input":'14,close,2',
        "config":'period,values,stdDev'
    },
    {
        "name":"BB.lower",
        "input":'14,close,2',
        "config":'period,values,stdDev'
    },{
        "name":"MACD",
        "input":'close,fastPeriod,slowPeriod,false,false',
        "config":'values,fastPeriod,slowPeriod,SimpleMAOscillator,SimpleMASignal'
    },{
        "name":"RSI",
        "input":'close,14',
        "config":'values,period'
    },{
        "name":"SMA",
        "input":'close,50',
        "config":'values,period'
    },{
        "name":"EMA",
        "input":'close,50',
        "config":'values,period'
    },{
        "name":"ADX",
        "input":'close,high,low,14',
        "config":'close,high,low,period'
    },{
        "name":"Lowest",
        "input":'close,14',
        "config":'values,period'
    },{
        "name":"Highest",
        "input":'close,14',
        "config":'values,period'
    }
];

class BaseStrategy {
    
    constructor() {
        //this.strategy = {};
    }
    
    async executeStrategy(symbol,stockData,strategyObj,isBacktesting = false){
        //console.log("\n stockData : " + stockData.length);
        var that = this;
        return new Promise(function(resolved, rejected) {
            var close = [];
            var open = [];
            var high = [];
            var low = [];
            var volume = [];
            var timeStamp = [];
            var candle = {};

            var values = stockData.map(async (obj) =>  {
                close.push(Number(obj.CLOSE));       
                open.push(Number(obj.OPEN));       
                high.push(Number(obj.HIGH));       
                low.push(Number(obj.LOW));        
                timeStamp.push(Number(obj.LASTTRADETIME));       
                volume.push(Number(obj.TRADEDQTY));       
            }); 

            candle.close = close.reverse();
            candle.open = open.reverse();
            candle.high = high.reverse();
            candle.low = low.reverse();
            candle.timeStamp = timeStamp;
            candle.volume = volume.reverse();
           
            var result = [];
            var output = {};
            //console.log("\n");
            //console.log("Strategy 1: " + strategyObj.symbol+" : "+strategyObj.id +" : "+strategyObj.name+" : "+strategyObj.interval);
            if(strategyObj && strategyObj.indicators && strategyObj.indicators.length > 0){
                //console.log("Strategy : " + strategyObj.symbol+" : "+strategyObj.id +" : "+strategyObj.name+" : "+strategyObj.interval);
                Promise.all(strategyObj.indicators.map(async (indicatorObj) => {
                    //console.log("\n indicatorObj : " + JSON.stringify(indicatorObj));
                    return new Promise(function(resolve, reject) {
                        try{
                            if(indicatorObj.indicator1 && indicatorObj.indicator1 != "" 
                            && indicatorObj.indicator2 && indicatorObj.indicator2 != "")
                            {
                                output.op = indicatorObj.op;
                                if(indicatorObj.indicator1 == 'number'){
                                    output.op1 = [];
                                    var length = isBacktesting ? stockData.length : 3;
                                    for(var i = 0; i < length; i++){
                                        output.op1.push(indicatorObj.indicator_config1);
                                    }
                                }
                                
                                else if(indicatorObj.indicator1  == 'open' || indicatorObj.indicator1   == 'low' || indicatorObj.indicator1 == 'close' || indicatorObj.indicator1 == 'high'  || indicatorObj.indicator1 == 'volume' ){
                                    var candle1 = eval('candle.'+indicatorObj.indicator1).reverse();
                                    output.op1 = isBacktesting ? candle1 : candle1.slice(0, 3);
                                    candle1 = null;
                                }
                                else if(String(indicatorObj.indicator1).split(".").length > 1){
                                    var str1 = indicatorObj.indicator1.split(".")[0]+".calculate("+JSON.stringify(that.getInputObject(candle,indicatorObj.indicator1,indicatorObj.indicator_config1))+")";
                                    var res1 = eval(str1); 
                                    var result = isBacktesting ? res1 : res1.slice(0, 3); //**********  dont't change **********  
                                    var op1 = [];
                                    result.map(obj=>{
                                        op1.push(obj[indicatorObj.indicator2.split(".")[1]])
                                    });
                                    output.op1 = op1;
                                }
                                else{
                                    var str1 = indicatorObj.indicator1+".calculate("+JSON.stringify(that.getInputObject(candle,indicatorObj.indicator1,indicatorObj.indicator_config1))+")";
                                    var res1 = eval(str1); 
                                    var op1 = isBacktesting ? res1.reverse() : res1.reverse().slice(0, 3); ////**********  dont't change **********  
                                    output.op1 = op1;
                                }
                                
                                if(indicatorObj.indicator2 == 'number'){
                                    output.op2 = [];
                                    var length = isBacktesting ? stockData.length : 3;
                                    for(var i = 0; i < length; i++){
                                        output.op2.push(indicatorObj.indicator_config2);
                                    }
                                    //output.op2 = [indicatorObj.indicator_config2,indicatorObj.indicator_config2,indicatorObj.indicator_config2];
                                }
                                else if(indicatorObj.indicator2 == 'open' || indicatorObj.indicator2 == 'low' || indicatorObj.indicator2 == 'close' || indicatorObj.indicator2 == 'high' || indicatorObj.indicator2 == 'volume')
                                {
                                    output.op2 = eval('candle.'+indicatorObj.indicator2).reverse().slice(0, 3);//
                                }   
                                else if(String(indicatorObj.indicator2).split(".").length > 1){
                                    var str2 = indicatorObj.indicator2.split(".")[0]+".calculate("+JSON.stringify(that.getInputObject(candle,indicatorObj.indicator2,indicatorObj.indicator_config2))+")";
                                    var res2 = eval(str2); 
                                    var result = isBacktesting ? res2 : res2.slice(0, 3);  ////**********  dont't change **********  
                                    var op2 = [];
                                    result.map(obj=>{
                                        op2.push(obj[indicatorObj.indicator2.split(".")[1]])
                                    });

                                    output.op2 = op2;
                                }
                                else{
                                    var str2 = indicatorObj.indicator2+".calculate("+JSON.stringify(that.getInputObject(candle,indicatorObj.indicator2,indicatorObj.indicator_config2))+")";
                                    var res2 = eval(str2);    
                                    var op2 = isBacktesting ? res2.reverse() :res2.reverse().slice(0, 3);  ////**********  dont't change **********  
                                    output.op2 = op2;
                                }

                                var finalResult = [];
                                var length = isBacktesting ? stockData.length - 2 : 1;
                                for(var i=0;i < length;i++)
                                {
                                    var first = i;
                                    var second = i+1;
                                    var third = i+2;

                                    var strategyResFlag = false;
                                    if(output.op == "Crossed Above"){
                                        var strategyStr1 = output.op1[first]+">="+output.op2[first]; 
                                        var strategy1 = eval(strategyStr1);
                                        //finalResult.push(strategy1);  
                                        var strategyStr2 = output.op1[second]+"<"+output.op2[second]; 
                                        var strategy2 = eval(strategyStr2);
                                        
                                        if(strategy1 && strategy2)
                                            strategyResFlag = true;

                                        finalResult.push(strategyResFlag);       
                                        //console.log("Crossed Above :   " + strategyStr1 +" : "+ strategyStr2 +" : "+JSON.stringify(output));
    
                                    }
                                    else if(output.op == "Crossed Below"){
                                        var strategyStr1 = output.op1[first]+"<="+output.op2[first]; 
                                        var strategy1 = eval(strategyStr1);
                                        //finalResult.push(strategy1); 
                                        var strategyStr2 = output.op1[second]+">"+output.op2[second]; 
                                        var strategy2 = eval(strategyStr2);
                                        if(strategy1 && strategy2)
                                            strategyResFlag = true;

                                        finalResult.push(strategyResFlag);  
                                      
                                        //console.log("Crossed Below :   " + strategyStr1 +" : "+ strategyStr2 +" : "+JSON.stringify(output));
                                    }
                                    else{
                                        var strategyStr = output.op1[first]+output.op+output.op2[first]; 
                                        strategyResFlag = eval(strategyStr);
                                        finalResult.push(strategyResFlag);   
                                    }
                                    if(isBacktesting)
                                        stockData[i]['signal'] = strategyResFlag;
                                }
                                   
                                //console.log("Strategy result  :   " + symbol +" : " + isBacktesting +" : " + finalResult);//+" > "+ JSON.stringify(stockData)
                                var flag = finalResult.every(x => x == true);  
                                res1 = indicatorObj = finalResult = first= second= third= null;
                                resolve(flag);   
                            }     
                            else{
                                console.error("First - " + e);
                                reject(e);
                            }                
                        }
                        catch(e){
                            console.error("Second  - " + e);
                            reject(e);
                        }
                    });        
                })).then(obj => {  
                    //console.log("\n Result :   " + symbol +" : " + JSON.stringify(stockData));
                    var strategyRes = obj.every(x => x == true);  
                    candle = output = result = null;
                    strategyObj.result = strategyRes;
                    if(isBacktesting)
                        return resolved(stockData);  
                    else
                        return resolved(strategyObj);       
                })
                .catch(err => {
                    rejected(err);
                    console.error("ExecuteStrategy Error: " + symbol +" > " + err);
                    err = null;
                });
            }
        })
    }

    getInputObject(candle,indicator,config){
        var inputObj= {};
        var selectedObj = {};
        for(var i=0;i<allIndicators.length;i++){
            if(allIndicators[i]['name'] == indicator){
                selectedObj = allIndicators[i];
                break;
            }
        }

        var attr = String(selectedObj.config).split(',');
        //console.log('\n\n attr ' + allIndicators[i] +">> "+selectedObj.config +" > "+JSON.stringify(attr));
        var val = String(config).split(',');
        for(var i=0;i<attr.length;i++){
            if(val[i] == "close" || val[i] == "open" || val[i] == "low"|| val[i] == "high"||val[i] == "volume")
            {
                val[i] = eval('candle.'+val[i]);
                //val[i] = val[i].reverse(); //**********  dont't change ********** 
            }

            inputObj[attr[i]] = eval(val[i]);       
        }
        //console.log('\n\n\ inputObj ' + JSON.stringify(inputObj));
        return inputObj;
    }
}

//Sync Upstox data on by Interval, eg 15 min sync
async function applyStrategy(list,interval){ 
    //console.log("\nApplyStrategy > " + list.length +"::"+  interval); 
    //Promise.all(
    list.map(strategyObj =>  {
        //console.log(strategyObj.id +" : "+ strategyObj.symbol);
       /*  strategyQueue.push({strategy: strategyObj}, function (err) {
            //console.log('strategyQueue  - ');// + strategyQueue.id +" : "+ strategyObj.symbol);
        }); */
    })//) 
}


var strategyQueue = async.queue(function(task, callback) {
    var strategyObj = task.strategy;
    var matchSymbols = [];  
    var symbol = strategyObj.symbol ? strategyObj.symbol:strategyObj;    
    var interval = strategyObj.interval;    
    //console.log("\n");
    getStockDataFromDb(symbol,interval).then(stockData => {
        //console.log("Symbol > " +symbol +":"+stockData.data.length);
        try{
            var data = JSON.parse(stockData.data); 
            //console.log("data > " +data.length +"::"+JSON.stringify(strategyObj));
            var base = new BaseStrategy();
           
            base.executeStrategy(strategyObj.symbol,data,strategyObj).then(finalResult => { 
                //console.log("finalResult > " + JSON.stringify(finalResult));
                var result = finalResult.result.every(x => x == true);  
                if(result){
                    matchSymbols.push(strategyObj.symbol);
                    //console.log("@ Strategy RESULT  > " + finalResult +"::"+ strategyObj.symbol);
                    matchSymbols.map(async (symbol) =>  {
                        //console.log("Place Order  : " +strategyObj.name +" : "+ strategyObj.interval +" : "+ strategyObj.symbol);
                        //eventEmitter.emit('placeOrder',{'strategy':strategyObj,"symbol":strategyObj.symbol,'interval':interval});
                    });

                    if(process.env.NODE_ENV=="production")
                    {
                        sendingMail("satish.patel41@gmail.com",strategyObj.name,matchSymbols).catch(console.error);
                    }
                }
                finalResult= strategyObj =base = null;     
                callback();        
            }).catch(error => 
            {
                console.error("base.executeStrategy ERROR > " + strategyObj.name +" : "+strategyObj.symbol +" : " + error);
                error = base = null;
                callback();     
            });
        }
        catch(e){
            console.error("base.executeStrategy Error: " + strategyObj.name +" : "+strategyObj.symbol +" : "+JSON.stringify(e));
            e = base = null;
            callback();     
        }
    });
},1);


strategyQueue.drain = function() {
 // console.log('all items have been processed');
};


async function executeLiveStrategy(list)
{  
    if(process.env.NODE_ENV != "production")
    {
        isTradingHours = true;
    }
    //console.log('list - ' +list.length +" :: "+ interval +" :: "+isTradingHours);
    
    if(isTradingHours){
        list.map(async(strategy)=>{
            await fetchLiveCandle(strategy.symbol,strategy.exchange,interval,start_date,end_date).then(response=>{
                //console.log('fetchLiveCandle - ' +response.OHLC); //applyStrategy([strategy],'15MINUTE'); 
                try{
                    var data = response.OHLC; 
                    //console.log('fetchLiveCandle - ' +data.length +" : "+ JSON.stringify(strategy)); 
                    var base = new BaseStrategy();
                    base.executeStrategy(strategy.symbol,data,strategy).then(finalResult => { 
                        //console.log("finalResult  : " +JSON.stringify(finalResult));
                        //var result = finalResult.result.every(x => x == true);  
                        if(finalResult.result){
                            price = data[0]['CLOSE'];
                            console.log("Place Order  --> " +strategy.name +" : "+ strategy.interval +" : "+ strategy.symbol +" : "+ price);
                            eventEmitter.emit('placeOrder',{'strategy':strategy,"symbol":strategy.symbol,'interval':interval,'price':price});
                        
                            var now = new Date();
                            var india = moment.tz(now, "Asia/Kolkata");
                            india.format(); 
                            var entryTime =india.date()+"-"+(india.month())+"-"+india.year() +"  "+india.hour()+":"+india.minute();
                            var appliedId = strategy.id;
                            var exitTime ="-"; 
                            var profit =0; 
                            var uid = strategy.uid;
                            var q = "INSERT INTO StrategyTriggered (appliedId,entryTime, exitTime,profit, uid)VALUES(?,?,?,?,?)";
                            var p = [appliedId,entryTime,exitTime, profit,uid];

                            //console.log("strategy  : " +JSON.stringify(strategy));
                            insertDB(q,p).then(responses => {
                                //console.log("StrategyTriggered > " + JSON.stringify(responses));
                            }); 
                            
                            if(process.env.NODE_ENV=="production")
                            {//sendingMail("satish.patel41@gmail.com",strategy.name,strategy.symbol).catch(console.error);
                            }
                        }
                        finalResult= strategy =base = null;     
                    }).catch(error => 
                    {
                        console.error("executeLiveStrategy -> base.executeStrategy -> " + strategy.name +" : "+strategy.symbol +" : " + error);
                        error = base = null;
                    });
                }
                catch(e){
                    console.error("executeLiveStrategy try catch: " + strategy.name +" : "+strategy.symbol +" : "+JSON.stringify(e));
                    e = base = null;
                }
            });
        });
    }
}

async function executeBacktestingStrategy(symbol,exchange,interval,strategy,start_date,end_date)
{  
    return await fetchLiveCandle(symbol,exchange,interval,start_date,end_date);      
}