const SMA = require('technicalindicators').SMA;
const EMA = require('technicalindicators').EMA;
const RSI = require('technicalindicators').RSI;
const BB = require('technicalindicators').BollingerBands;
const ADL = require('technicalindicators').ADL;
const ADX = require('technicalindicators').ADX;
const ATR = require('technicalindicators').ATR
const MACD = require('technicalindicators').MACD;

function getIndicator(symbol,stockData,strategyList,isBackTesting){
    var closes = [];
    var opens = [];
    var highs = [];
    var lows = [];
    var timestamps = [];
    var values = stockData.map(obj =>  {
        closes.push(obj.close);       
        opens.push(obj.open);       
        highs.push(obj.high);       
        lows.push(obj.low);       
        timestamps.push(obj.timestamp);       
    });  
    
    timestamps = timestamps.reverse();//**********  dont't change **********  
    Promise.all(strategyList.map(strategyObj =>  {     
       return new Promise(function(resolved, rejected) {
        var result = [];
        var output = new Array();
        Promise.all(strategyObj.indicators.map(indicatorObj =>  {
            return new Promise(function(resolve, reject) {
                try{
                    indicatorObj.values = eval(indicatorObj.values);
                    var str = indicatorObj.indicator+".calculate("+JSON.stringify(indicatorObj)+")";
                    var res = eval(str);  
                    var op = isBackTesting ? res.reverse():res.reverse().slice(0, 3);  //**********  dont't change **********  
                    output.push(op);     
                  // console.log("*indicators " +symbol +" > " +indicatorObj.indicator +">> "+JSON.stringify(output));
                    return resolve(output);                        
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
                closes = closes.reverse(); //**********  dont't change **********  
                result.push(eval(strategyObj.strategy));   
                //console.log("***** " +result +":: "+strategyObj.strategy);
                closes = closes.reverse(); //**********  dont't change **********  
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
    })).then(finalResult => { 
        var finalResultFlag = finalResult.every(x => x == true);
        console.log("%%% strategy RESULT  > " +symbol +" > " +finalResultFlag +" >> "+JSON.stringify(finalResult));
        closes =  opens =  highs = lows = timestamps = finalResult=  null;
    }).catch(error => 
    {
        console.log("OUTER LOOP ERROR > " + error)
    });
 }

 Array.prototype.insert = function(i,...rest){
    return this.slice(0,i).concat(rest,this.slice(i));
  }