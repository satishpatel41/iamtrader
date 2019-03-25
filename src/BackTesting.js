var SMA = require('technicalindicators').SMA;
var EMA = require('technicalindicators').EMA;
var RSI = require('technicalindicators').RSI;
var BB = require('technicalindicators').BollingerBands;
var ADL = require('technicalindicators').ADL;
var ADX = require('technicalindicators').ADX;
var ATR = require('technicalindicators').ATR
var MACD = require('technicalindicators').MACD;
var bullish = require('technicalindicators').bullish;

async function startBackTesting(symbol,stockData,strategyList,isBackTesting){ 
    var closes = [];
    var opens = [];
    var highs = [];
    var lows = [];
    var timestamps = [];
    var values = stockData.map(async (obj) =>  {
        closes.push(Number(obj.close));       
        opens.push(Number(obj.open));       
        highs.push(Number(obj.high));       
        lows.push(Number(obj.low));       
        timestamps.push(Number(obj.timestamp));       
    });  
    var result = [];
    var output = new Array();
    timestamps = timestamps.reverse();//**********  dont't change **********  
    return Promise.all(strategyList.strategy.map(async (strategyObj) => {  
        return new Promise(function(resolved, rejected) {   
            Promise.all(strategyObj.indicators.map(async (indicatorObj) => {
                return new Promise(function(resolve, reject) {
                    try{
                        if(indicatorObj.indicator && indicatorObj.indicator != ""){
                            if(indicatorObj.values == "closes")
                                indicatorObj.values = eval(indicatorObj.values);
                            else
                                indicatorObj.values = closes;
                            
                            var str = indicatorObj.indicator+".calculate("+JSON.stringify(indicatorObj)+")";
                            var res = eval(str); 
                            var op = isBackTesting ? res.reverse():res.reverse().slice(0, 3);  //**********  dont't change **********  
                            output.push(op);     
                           // console.log("backTesting *indicators " +symbol +" > " +closes[0] +">> "+JSON.stringify(output));
                            indicatorObj = null;
                            resolve(op);   
                        }     
                        else{
                            resolve("");   
                        }                
                    }
                    catch(e){
                        reject(e);
                    }
                });        
            }))
            .then(obj => { 
                closes = closes.reverse(); //**********  dont't change **********  
                var strategyRes = [];

                for(var i=0;i < obj[0].length - 2;i++)
                {
                    if(result[i] == null || result[i] == undefined )
                    {
                        result[i] = new Array();
                    }
                    var flag = eval(strategyObj.strategy);   
                    
                    var india = moment.tz(new Date(Number(timestamps[i])), "Asia/Kolkata");
                    india.format(); 
                    var d = india.date() +"/"+(india.month() + 1) +"/"+india.year()+" "+india.hour()+":"+india.minute();
                    result[i].push({date:d, flag : flag}); 
                }
                closes = closes.reverse(); //**********  dont't change **********  
                //console.log("\n \n  then " +strategyObj.strategy +"::: "+JSON.stringify(result));

                return resolved(result);                   
            })
            .catch(err => {
                rejected(err);
                console.log("INNER LOOP : " + err)
            });
        })
    }));
 }

Array.prototype.insert = function(i,...rest){
    return this.slice(0,i).concat(rest,this.slice(i));
}