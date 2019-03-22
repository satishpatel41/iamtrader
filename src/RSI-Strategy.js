const SMA = require('technicalindicators').SMA;
const EMA = require('technicalindicators').EMA;
const RSI = require('technicalindicators').RSI;
const BB = require('technicalindicators').BollingerBands;
const ADL = require('technicalindicators').ADL;
const ADX = require('technicalindicators').ADX;
const ATR = require('technicalindicators').ATR
const MACD = require('technicalindicators').MACD;
var bullish = require('technicalindicators').bullish;

async function getIndicator(symbol,stockData,strategyList,isBackTesting){
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
                        var op = isBackTesting ? res.reverse():res.reverse().slice(0, 3);  //**********  dont't change **********  
                        output.push(op);     
                     // console.log("*indicators " +symbol +" > " +closes[0] +">> "+JSON.stringify(output));
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
            if(isBackTesting)
            {      
                closes = closes.reverse(); //**********  dont't change **********  
                var strategyRes = [];
                for(var i=0;i < output[0].length;i++)
                {
                    result.push(eval(strategyObj.strategy));   
                    var india = moment.tz(new Date(Number(timestamps[i])), "Asia/Kolkata");
                    india.format(); 
                    var d = india.date() +"/"+(india.month() + 1) +"/"+india.year()+" "+india.hour()+":"+india.minute();//new Date(row.timestamp);
                    strategyRes.push(result.every(x => x == true));  
                    console.log("\n" + symbol +" > " +strategyObj.strategy +" :: "+ d +"  > "+closes[i] +"::"+output[0][i]);  // +"::"+  strategyRes +" > "+ result)
                }
                closes = closes.reverse(); //**********  dont't change **********  
                output = result = null;
                console.log("*****strategyRes " +strategyRes);
                return resolved(strategyRes);    
            }
            else{
                //console.log("***** " +strategyObj.strategy);
                closes = closes.reverse(); //**********  dont't change **********  
                highs = highs.reverse(); //**********  dont't change **********  
                lows = lows.reverse(); //**********  dont't change **********  
                opens = opens.reverse(); //**********  dont't change **********  

                var strategy = eval(strategyObj.strategy);
                result.push(strategy);   
                //console.log("*" +symbol +" > " + result +":: "+ eval((closes[0] - opens[0])/highs[0] - lows[0]));
                closes = closes.reverse(); //**********  dont't change **********  
                highs = highs.reverse(); //**********  dont't change **********  
                lows = lows.reverse(); //**********  dont't change **********  
                opens = opens.reverse(); //**********  dont't change **********  
                var d =new Date(Number(timestamps[0])); 
                var strategyRes = result.every(x => x == true);  
                //console.log(symbol +" > " + d +"  > "+  strategyRes +" > "+ result);  
                output = result = null;
                
                return resolved(strategyRes);       
            }          
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