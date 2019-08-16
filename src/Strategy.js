
var technicalindicators = require('technicalindicators');
var fs = require('fs');
var path = require('path');
var moment = require('moment-timezone');

var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var date = new Date();
var today = date.getDate() +"-"+(date.getMonth() +  1)+"-"+date.getFullYear();
var time = date +":"+date.getHours() +":"+date.getMinutes();
var days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

var strategyObj = {
    symbol:'BANKNIFTY19JANFUT',
    indicators:[{indicator:'rsi',settings:'14',value:'60',op:'>='}
               ,{indicator:'sma',settings:'20',value:'close',op:'>='}],
    interval:'15min'
};



    

//console.log("data  : " + x + " :: "+JSON.stringify(database.data));

/*  var df =  dataForge.fromJSON(JSON.stringify(obj.data)) // Read CSV file (or JSON!)
//.setIndex("LASTTRADETIME")
.dropSeries(["cp"]) // Drop certain columns.
.where(row => calculateIndicators(row)) // Filter rows.
.select(row => transform(row)); // Transform the data. 

const chronoOrder = df.reverse();
var output = df.toJSON();

var valuesDf = df.detectValues(); */ 
//console.log(valuesDf.toString());

function backTesting(stockData,path){ 

  /* var result = Enumerable.from(stockData).forEach(function(obj)
  {
      console.log(obj.sma + " > "+ obj.rsi);
      return obj.rsi >= 60;
  }); */

  //var example = Enumerable(stockData).where(function(item){ return item.rsi >= 60; });

  //var result = Enumerable.from(stockData).where(function(obj){return obj.rsi >= 60});
  //var result = Enumerable.from(stockData).select((val, i) => ({ return val.rsi >= 60}));

  var result = stockData.filter(function (item) {
      return item.rsi >= 60;
  });

  var result = result.filter(function (item) {
      return item.CLOSE >= item.sma;              
  });

  //console.log("\n \n stockData >> " + path +" >> "+result[0].LASTTRADETIME);


  /* var stockData =response.data;

  //console.log("\n \n stockData >> " + JSON.stringify(stockData));


  stockData= stockData.map(x => 
  {
      var obj = x;
      obj.LASTTRADETIME = new Date(obj.LASTTRADETIME);

      //console.log("\n \n LASTTRADETIME >> " +  obj.LASTTRADETIME);
      return obj;
  });  
  var closeData = stockData.map(x => x.CLOSE);  
  var inputRSI = {
      values : closeData,
      period : 14
  };
  var rsiData = technicalindicators.RSI.calculate(inputRSI);
  var inputSMA = {
      values : closeData,
      period : 20
  };
  var smaData = technicalindicators.SMA.calculate(inputSMA);
  var BB = technicalindicators.BollingerBands
  var period = 14
  var inputBB = {
      period : period, 
      values : closeData ,
      stdDev : 2 
  }
  var bbData = BB.calculate(inputBB);
  //console.log("\n \n BB >> " + JSON.stringify(bbData));

  var index = 0;
  var buyprice = 0;
  var sellprice = 0;
  var profit = 0;
  var totalProfit = 0;
  var isBuySignalGenerated = false;
  var isSellSignalGenerated = false;
  var buyCall = 0;
  var sellCall = 0;
  
  stockData= stockData.map(x => 
  {
      var obj = x;
      obj.rsi = index > inputRSI.period?rsiData[index - inputRSI.period]:0;
      obj.sma = index >= inputSMA.period?smaData[index - inputSMA.period]:0;
      obj.bb = index >= inputBB.period?bbData[index - inputBB.period]:null;

      var date = new Date(obj.LASTTRADETIME);;

      //console.log("date " + date);

      if(obj.rsi >= 60 && date.getDay() == date.getDay() && date.getMonth()== date.getMonth())
      {
          log(obj.rsi);
      }
      if(obj.rsi >= 60 && stockData[index - 1].rsi < 60)
      {
          buyCall++;
          buyprice = x.CLOSE;
          isBuySignalGenerated = true;
          console.log("\n\n BUY *>> " + x.LASTTRADETIME +" >> "+ buyprice);
      }
      else if(obj.rsi != 0 && obj.rsi <= 40 && stockData[index - 1].rsi > 40)
      {
          sellCall++;
          sellprice = x.CLOSE;
          isSellSignalGenerated = true;
          console.log("\n\n SELL *>> " + x.LASTTRADETIME +" >> "+ sellprice);
      }
      
      if(isBuySignalGenerated)
      {
          if(obj.rsi < 60 || x.CLOSE < obj.sma)
          {
              isBuySignalGenerated = false;  
              profit = x.CLOSE - buyprice;
              totalProfit += profit;
              console.log("\n\n EXIT CALL *>> " + x.LASTTRADETIME+" close >> "+x.CLOSE+" profit>> "+ profit+" totalProfit >> "+ totalProfit +">>"+ buyCall);
          }
      }else if(isSellSignalGenerated)
      {
          if(obj.rsi > 40 || x.CLOSE > obj.sma)
          {
              isSellSignalGenerated = false;  
              profit = sellprice - x.CLOSE;
              totalProfit += profit;
              console.log("\n\n EXIT SELL *>> " + x.LASTTRADETIME+" close >> "+x.CLOSE+" profit>> "+ profit+" totalProfit >> "+ totalProfit +">>"+ sellCall);
          }
      } 
      index++;
      return obj;
  }); 
  console.log(stockData); */
}

function searchPattern(row)
{
    var now = new Date();
    var thisMonth = months[now.getMonth()].slice(0,3).toUpperCase();
    var syombolPattern = /BANKNIFTY/i;
    var monthPattern = new RegExp(thisMonth, 'gi');
    var isWeeklyExpiry = true;
    var arr = row.split(",");
    var isMatchingSymbol  = String(arr[3]).search(syombolPattern);
 
  if(isMatchingSymbol >= 0){      
    var isMatchFound = false;
    var isMatchingMonth  = String(arr[3]).search(monthPattern);
    var isFuture = String(arr[3]).search("FUT");
    for(var i =0 ; i < 7;i++){
        if(days[now.getDay()] == "Thursday" || days[now.getDay()] == "Wednesday")
        {
            var fullyear = now.getFullYear();
            var month = now.getMonth() + 1;
            var day = now.getDate();
            day = String(day).length < 2 ? "0"+now.getDate() : now.getDate();
            var symbol = "BANKNIFTY" + String(fullyear).slice(2,4) +month+day;//18121328400CE
            var currentPrice = Math.round(arr[2] / 100) * 100;
            var pricePattern = new RegExp(String(currentPrice), 'gi');
            var isMatchingPrice  = String(arr[3]).search(pricePattern);
            var isMatchingWeek  = String(arr[3]).search(symbol);

            if(isMatchingWeek >= 0 && isMatchingPrice >=0){
                
                var isCE = String(arr[3]).search("CE");
                var isPE = String(arr[3]).search("PE");

                console.log("\n MATCH " + isCE +" > "+ isPE +" > "+arr[3]);

                if(isCE > 0)
                  bankNiftyCall.CE = arr[3];
                else if(isPE > 0)
                  bankNiftyCall.PE = arr[3];  
                isMatchFound = true;
            }
        }
        now.setDate(now.getDate() + 1);
    }

    if(!isMatchFound){
        if(isMatchingMonth >= 0 && isFuture >=0){
            //console.log("\n MATCH " + isMatchingWeek +" > "+ symbol +" > "+arr[3]);
            bankNiftyCall.FUTURE = arr[3];
            return row;
        }else{
            return 0;
        }
    }else{
        return row;
    }    
  }
  else{
      return 0;
  }
}




var index = 0;
var buyprice = 0;
var sellprice = 0;
var profit = 0;
var totalProfit = 0;
var isBuySignalGenerated = false;
var isSellSignalGenerated = false;
var buyCall = 0;
var sellCall = 0;

function calculateIndicators(row)
{
  row.rsi = rsi.nextValue(Number(row.CLOSE));
  row.sma = sma.nextValue(Number(row.CLOSE));
  row.bb = bb.nextValue(Number(row.CLOSE)); 

var d =new Date(Number(row.LASTTRADETIME));
var india = moment.tz(d, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
india.format(); 
row.date =india.date() +"/"+(india.month()+1) +"/"+india.year()+" "+india.hour()+":"+india.minute();

    if(india.hour() == 9 && india.minute() == 25 && row.bb && row.CLOSE > row.bb.upper)
    {
        buyCall++;
          buyprice = row.CLOSE;
          isBuySignalGenerated = true;
          console.log("\n\n BUY *>> " + row.date  +" >> "+ buyprice);
    }

    if(isBuySignalGenerated)
    {
        if(row.bb && row.CLOSE <= row.bb.middle)
        {
            isBuySignalGenerated = false;  
            profit = row.CLOSE - buyprice;
            totalProfit += profit;
            console.log("\n\n EXIT CALL *>> " + row.date+" close >> "+row.CLOSE+" profit>> "+ profit+" totalProfit >> "+ totalProfit +">>"+ buyCall);
        }
    }else if(isSellSignalGenerated)
    {
        if(obj.rsi > 40 || row.CLOSE > obj.sma)
        {
            isSellSignalGenerated = false;  
            profit = sellprice - row.CLOSE;
            totalProfit += profit;
            console.log("\n\n EXIT SELL *>> " + row.date+" close >> "+row.CLOSE+" profit>> "+ profit+" totalProfit >> "+ totalProfit +">>"+ sellCall);
        }
    } 
    index++;
  
  return row;
}

function log(message){

    if(process.env.NODE_ENV=="production")
        return;
        
    date = new Date();
   
    today = date.getDate() +"-"+(date.getMonth() +1)+"-"+date.getFullYear();
  
    var path = "logs/log-"+today+".txt";
    try {
        if (fs.existsSync(path)) {
            fs.appendFile(path, "\n"+date +" "+message, function (err) {
            if (err) throw err;
            }); 
        }else {
            fs.writeFile(path, "\n"+date +" "+message, function (err) {
                if (err) throw err;
            }); 
        }
    }    
    catch(err) {
        console.error(err);
        fs.writeFile(path, "\n"+date +" "+message, function (err) {
            if (err) throw err;
        }); 
    }    
}

function addIndicators(response,path){ 
  var stockData =response.data;
  //stockData=  //stockData.map(x => 

  for (let x of stockData) {
      var obj = x;
      obj.LASTTRADETIME = new Date(obj.LASTTRADETIME);
       return obj;
  }

  var closeData =[];// stockData.map(x => x.CLOSE);  
  for (let x of stockData) {
    closeData.push(x.CLOSE);
  }

  var inputRSI = {
      values : closeData,
      period : 14
  };
 /*  var rsiData = technicalindicators.RSI.calculate(inputRSI);
  var inputSMA = {
      values : closeData,
      period : 20
  };
  var smaData = technicalindicators.SMA.calculate(inputSMA);
  var BB = technicalindicators.BollingerBands;
  var period = 14;
  var inputBB = {
      period : period, 
      values : closeData ,
      stdDev : 2 
  }
  var bbData = BB.calculate(inputBB); */
  //console.log("\n \n BB >> " + JSON.stringify(bbData));

  var index = 0;
  var buyprice = 0;
  var sellprice = 0;
  var profit = 0;
  var totalProfit = 0;
  var isBuySignalGenerated = false;
  var isSellSignalGenerated = false;
  var buyCall = 0;
  var sellCall = 0;
  
  for (let x of stockData) {
  //stockData= stockData.map(x =>{
      var obj = x;
     /*  obj.rsi = index > inputRSI.period?rsiData[index - inputRSI.period]:0;
      obj.sma = index >= inputSMA.period?smaData[index - inputSMA.period]:0;
      obj.bb = index >= inputBB.period?bbData[index - inputBB.period]:null; */

      index++;
      //console.log("\nobj > " + JSON.stringify(obj));
      return obj;
  } 


  backTesting(stockData,path);
  //log(stockData);
}

var bankNiftyCall;
function checkBankNiftyExpiry(data)
{
      bankNiftyCall = new Object();

     // fs.readFile('data/index/nse_fo.txt', function(err, response) {      
        //var  data= JSON.parse(response).data;
        const transformedData = new dataForge.DataFrame(data)
        .where(row => searchPattern(row)) // Filter rows.
        .toArray();                        // Back to normal JavaScript data!.
   
       console.log("WATCH BANK NIFTY  ****** " + JSON.stringify(bankNiftyCall)); 
       console.log(" \n \n BANK NIFTY >> data >>" + transformedData);
    //});
}