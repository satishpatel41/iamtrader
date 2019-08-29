var SMA = require('technicalindicators').SMA;
var EMA = require('technicalindicators').EMA;
var RSI = require('technicalindicators').RSI;
var BB = require('technicalindicators').BollingerBands;
var ADL = require('technicalindicators').ADL;
var ADX = require('technicalindicators').ADX;
var ATR = require('technicalindicators').ATR
var MACD = require('technicalindicators').MACD;
var bullish = require('technicalindicators').bullish;
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
    }
];

class BaseStrategy {
    
    constructor() {
        //this.strategy = {};
    }
    
    async executeStrategy(symbol,stockData,strategyObj){
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

            //timeStamp = timeStamp;//**********  dont't change **********  
            candle.close = close.reverse();
            candle.open = open.reverse();
            candle.high = high.reverse();
            candle.low = low.reverse();
            candle.timeStamp = timeStamp;
            candle.volume = volume.reverse();
           
            var result = [];
            var output = {};
            //console.log("Strategy 1: " + strategyObj.symbol+" : "+strategyObj.id +" : "+strategyObj.name+" : "+strategyObj.interval);
            if(strategyObj && strategyObj.indicators && strategyObj.indicators.length > 0){
                //console.log("Strategy : " + strategyObj.symbol+" : "+strategyObj.id +" : "+strategyObj.name+" : "+strategyObj.interval);
                Promise.all(strategyObj.indicators.map(async (indicatorObj) => {
                    //console.log("\n strategyObj : " + JSON.stringify(strategyObj));
                    return new Promise(function(resolve, reject) {
                        try{
                            if(indicatorObj.indicator1 && indicatorObj.indicator1 != "" 
                            && indicatorObj.indicator2 && indicatorObj.indicator2 != "")
                            {
                                output.op = indicatorObj.op;
                                //console.log("\n indicator2 - " +indicatorObj.indicator2 +" > " + String(indicatorObj.indicator2).split(".").length);
                                if(indicatorObj.indicator1 == 'number'){
                                    output.op1 = [indicatorObj.indicator_config1,indicatorObj.indicator_config1,indicatorObj.indicator_config1];
                                }
                                else if(indicatorObj.indicator1  == 'open' || indicatorObj.indicator1   == 'low' || indicatorObj.indicator1 == 'close' || indicatorObj.indicator1 == 'high'  || indicatorObj.indicator1 == 'volume' ){
                                    output.op1 = eval('candle.'+indicatorObj.indicator1).reverse().slice(0, 3);//reverse().
                                }
                                else if(String(indicatorObj.indicator1).split(".").length > 1){
                                    var str1 = indicatorObj.indicator1.split(".")[0]+".calculate("+JSON.stringify(that.getInputObject(candle,indicatorObj.indicator1,indicatorObj.indicator_config1))+")";
                                    var res1 = eval(str1); 
                                    //var op1 = res1[indicatorObj.indicator1.split(".")[1]].reverse().slice(0, 3);  //**********  dont't change **********  
                                   
                                    var result = res1.slice(0, 3); //reverse(). //**********  dont't change **********  
                                    var op1 = [];
                                    result.map(obj=>{
                                        op1.push(obj[indicatorObj.indicator2.split(".")[1]])
                                    });
                                    output.op1 = op1;
                                    //console.log("\n op1 - " +indicatorObj.indicator1 +" > " + op1);
                                }
                                else{
                                    var str1 = indicatorObj.indicator1+".calculate("+JSON.stringify(that.getInputObject(candle,indicatorObj.indicator1,indicatorObj.indicator_config1))+")";
                                    var res1 = eval(str1); 
                                    var op1 = res1.reverse().slice(0, 3); ////**********  dont't change **********  
                                    output.op1 = op1;
                                }
                                
                                if(indicatorObj.indicator2 == 'number'){
                                    output.op2 = [indicatorObj.indicator_config2,indicatorObj.indicator_config2,indicatorObj.indicator_config2];
                                }
                                else if(indicatorObj.indicator2 == 'open' || indicatorObj.indicator2 == 'low' || indicatorObj.indicator2 == 'close' || indicatorObj.indicator2 == 'high' || indicatorObj.indicator2 == 'volume')
                                {
                                    output.op2 = eval('candle.'+indicatorObj.indicator2).reverse().slice(0, 3);//
                                }   
                                else if(String(indicatorObj.indicator2).split(".").length > 1){
                                    var str2 = indicatorObj.indicator2.split(".")[0]+".calculate("+JSON.stringify(that.getInputObject(candle,indicatorObj.indicator2,indicatorObj.indicator_config2))+")";
                                     //console.log("\n op2 - " +indicatorObj.indicator2 +" > " + str2);
                                    var res2 = eval(str2); 
                                    //console.log("\n str2 - " +indicatorObj.indicator2 +" > " + res2 +" - "+ indicatorObj.indicator2.split(".")[1]);
                                    //var op2 = res2[indicatorObj.indicator2.split(".")[1]].reverse().slice(0, 3);  //**********  dont't change ********** 
                                    var result = res2.slice(0, 3);  ////**********  dont't change **********  
                                    var op2 = [];
                                    result.map(obj=>{
                                        op2.push(obj[indicatorObj.indicator2.split(".")[1]])
                                    });

                                    output.op2 = op2;
                                    //console.log("\n op3 - " +indicatorObj.indicator2 +" > " + op2);
                                }
                                else{
                                    var str2 = indicatorObj.indicator2+".calculate("+JSON.stringify(that.getInputObject(candle,indicatorObj.indicator2,indicatorObj.indicator_config2))+")";
                                    var res2 = eval(str2); 
                                    var op2 = res2.reverse().slice(0, 3);  ////**********  dont't change **********  
                                    output.op2 = op2;
                                }
                                                                
                                //console.log("\n indicators " +strategyObj.name +": "+symbol +" > " +JSON.stringify(output));
                                res1 = indicatorObj = null;
                                //result.push(output);
                                resolve(output);   
                            }     
                            else{
                                reject(e);
                            }                
                        }
                        catch(e){
                            reject(e);
                        }
                    });        
                }))
                .then(obj => { 
                    //candle.close = candle.close.reverse(); //**********  dont't change **********  
                    //candle.high = candle.high.reverse(); //**********  dont't change **********  
                    //candle.low = candle.low.reverse(); //**********  dont't change **********  
                    //candle.open = candle.open.reverse(); //**********  dont't change **********  
                
                    //console.log("Result 1:" + symbol +" : " + JSON.stringify(obj));

                    if(obj[0].op == "Crossed Above"){
                        //if(obj[0].op1[0].length > 0 && obj[0].op2[0].length > 0){
                            var strategyStr1 = obj[0].op1[0]+">="+obj[0].op2[0]; 
                            var strategy1 = eval(strategyStr1);
                            result.push(strategy1);  

                            var strategyStr2 = obj[0].op1[1]+"<"+obj[0].op2[1]; 
                            var strategy2 = eval(strategyStr2);

                            //console.log("Result :" + strategyStr1 +"   :   " + strategyStr2);
                            result.push(strategy2);   
                        /* }else{
                            result.push(false);
                        }  */ 
                    }
                    else if(obj[0].op == "Crossed Below"){
                        //if(obj[0].op1[0].length > 0 && obj[0].op2[0].length > 0){
                            var strategyStr1 = obj[0].op1[0]+"<="+obj[0].op2[0]; 
                            var strategy1 = eval(strategyStr1);
                            result.push(strategy1); 
                            
                            var strategyStr2 = obj[0].op1[1]+">"+obj[0].op2[1]; 
                            var strategy2 = eval(strategyStr2);
                            result.push(strategy2);  
                       /*  }else{
                            result.push(false);
                        }  */ 
                    }
                    else{
                        //console.log("obj " + symbol +" > "+JSON.stringify(obj));
                        //if(obj[0].op1.length > 0 && obj[0].op2.length > 0){
                            var strategyStr = obj[0].op1[0]+obj[0].op+obj[0].op2[0]; 
                            var strategy = eval(strategyStr);
                            result.push(strategy);   
                        /* }else{
                            result.push(false);
                        } */
                    }
                   // candle.close = candle.close.reverse(); //**********  dont't change **********  
                   // candle.high = candle.high.reverse(); //**********  dont't change **********  
                   // candle.low = candle.low.reverse(); //**********  dont't change **********  
                   // candle.open = candle.open.reverse(); //**********  dont't change **********  
                    var d =new Date(Number(candle.timeStamp[0])); 
                   //console.log("result " + symbol +" : " + result);
                    var strategyRes = result.every(x => x == true);  
                    candle = output = result = d = null;
                    strategyObj.result = strategyRes;
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
        strategyQueue.push({strategy: strategyObj}, function (err) {
            //console.log('strategyQueue  - ');// + strategyQueue.id +" : "+ strategyObj.symbol);
        });
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
    console.log('list - ' +list.length +" :: "+ isTradingHours);
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
                            //eventEmitter.emit('sendNotification',{'strategy':strategy,"symbol":strategy.symbol,'interval':interval,'price':price});
                        
                            if(process.env.NODE_ENV=="production")
                            {
                                sendingMail("satish.patel41@gmail.com",strategy.name,matchSymbols).catch(console.error);
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