var SMA = require('technicalindicators').SMA;
var EMA = require('technicalindicators').EMA;
var RSI = require('technicalindicators').RSI;
var BB = require('technicalindicators').BollingerBands;
var ADL = require('technicalindicators').ADL;
var ADX = require('technicalindicators').ADX;
var ATR = require('technicalindicators').ATR
var MACD = require('technicalindicators').MACD;
var bullish = require('technicalindicators').bullish;

class BaseStrategy {
    constructor() {
    }

    async executeStrategy(symbol,stockData,strategyList){
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
                                    op = str = res = indicatorObj = null;
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
                        
                        output = result = i = d = null;
                        //closes =  opens =  highs = lows = timestamps = finalResult=  strategyObj = null;
                        return resolved(strategyRes);       
                                    
                    })
                    .catch(err => {
                        rejected(err);
                        console.log("INNER LOOP : " + err);
                        err = null;
                    });
            })
        }));
    }

}

//Sync Upstox data on by Interval, eg 15 min sync
async function applyStrategy(list,interval,strategy){ 
    //console.log("ApplyStrategy > " + list.length +"::"+   strategy.name +"::"+ interval);
    var base;
    var matchSymbols = [];
    return Promise.all(list.map(async (x) =>  {
    var symbol = x.symbol ? x.symbol:x;    
    return getStockDataFromDb(symbol,interval);          
    })).then(stockData => {
        var arr = stockData.map(async (dataObj) =>  {
            try{
                var data = JSON.parse(dataObj.data); 
                base = new BaseStrategy();
                await base.executeStrategy(dataObj.symbol,data,strategy).then(finalResult => { 
                    var finalResultFlag = finalResult.every(x => x == true);
                    if(finalResultFlag){
                        matchSymbols.push(dataObj.symbol);
                        //console.log("Strategy RESULT  > " + finalResult +"::"+   strategy.name +"::"+ dataObj.symbol +" > "+ matchSymbols.length);
                    }
                    finalResult= finalResultFlag= dataObj =base = null;             
                }).catch(error => 
                {
                    console.log("OUTER LOOP ERROR > " + error);
                    error = base = null;
                });
            }
            catch(e){
                console.log("applyStrategy Error: " + JSON.stringify(e));
                e = base = null;
            }
        });       
      
        Promise.all(arr).then(a=>
        {
            console.log("Strategy result  > " +today +" : "+strategy.name+" : "+ interval +" : "+ matchSymbols);

            if(process.env.NODE_ENV=="production")
            {
                sendingMail("satish.patel41@gmail.com",strategy.name,matchSymbols).catch(console.error);
            }
            
            closes =  opens =  highs = lows = timestamps =   matchSymbols =null;
            return {strategy:strategy.name,matchSymbols:matchSymbols};
        })
        .catch(err => {
            //console.log("applyStrategy error 1  " + err);
            err =null;
        });
                    
    })
    .catch(error => { 
        //console.log("applyStrategy error  2  " + err);
        error =null;
    }); 
}