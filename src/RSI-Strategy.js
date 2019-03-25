var SMA = require('technicalindicators').SMA;
var EMA = require('technicalindicators').EMA;
var RSI = require('technicalindicators').RSI;
var BB = require('technicalindicators').BollingerBands;
var ADL = require('technicalindicators').ADL;
var ADX = require('technicalindicators').ADX;
var ATR = require('technicalindicators').ATR
var MACD = require('technicalindicators').MACD;
var bullish = require('technicalindicators').bullish;

async function executeStrategy(symbol,stockData,strategyList){
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

    timestamps = timestamps.reverse();//**********  dont't change **********  
    return Promise.all(strategyList.strategy.map(async (strategyObj) => {  
        return new Promise(function(resolved, rejected) {
        var result = [];
        var output = new Array();
        Promise.all(strategyObj.indicators.map(async (indicatorObj) => {
            return new Promise(function(resolve, reject) {
                try{
                    if(indicatorObj.indicator && indicatorObj.indicator != ""){
                        if(indicatorObj.values == "closes")
                            indicatorObj.values = eval(indicatorObj.values);
                        else
                            indicatorObj.values = closes;
                        
                        //console.log("*getIndicator " +symbol +" > " +closes[0] +" ::"+ indicatorObj.values[0]);
                        var str = indicatorObj.indicator+".calculate("+JSON.stringify(indicatorObj)+")";
                        var res = eval(str); 
                        //console.log("*getIndicator " +res); 
                        var op = res.reverse().slice(0, 3);  //**********  dont't change **********  
                        output.push(op);     
                     //console.log("*indicators " +symbol +" > " +closes[0] +">> "+JSON.stringify(output));
                        indicatorObj = null;
                        resolve(output);   
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
            //console.log("***** " +strategyObj.strategy);
            closes = closes.reverse(); //**********  dont't change **********  
            highs = highs.reverse(); //**********  dont't change **********  
            lows = lows.reverse(); //**********  dont't change **********  
            opens = opens.reverse(); //**********  dont't change **********  
            var i = 0;
            var strategy = eval(strategyObj.strategy);
            result.push(strategy);   
            //console.log("*" +symbol +" > " + result +":: "+ eval((closes[0] - opens[0])/highs[0] - lows[0]));
            closes = closes.reverse(); //**********  dont't change **********  
            highs = highs.reverse(); //**********  dont't change **********  
            lows = lows.reverse(); //**********  dont't change **********  
            opens = opens.reverse(); //**********  dont't change **********  
            var d =new Date(Number(timestamps[0])); 
            var strategyRes = result.every(x => x == true);  
            
           // console.log(symbol +" > " + d +"  > "+  strategyRes +" > "+ result);  
            
            output = result = null;
            //closes =  opens =  highs = lows = timestamps = finalResult=  strategyObj = null;
            return resolved(strategyRes);       
                     
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