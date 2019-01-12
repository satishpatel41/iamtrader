
var technicalindicators = require('technicalindicators');
var fs = require('fs');

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

function backTesting(stockData:any,path:String){ 

  /* var result = Enumerable.from(stockData).forEach(function(obj)
  {
      console.log(obj.sma + " > "+ obj.rsi);
      return obj.rsi >= 60;
  }); */

  //var example = Enumerable(stockData).where(function(item){ return item.rsi >= 60; });

  //var result = Enumerable.from(stockData).where(function(obj){return obj.rsi >= 60});
  //var result = Enumerable.from(stockData).select((val, i) => ({ return val.rsi >= 60}));

  var result = stockData.filter(function (item:any) {
      return item.rsi >= 60;
  });

  var result = result.filter(function (item:any) {
      return item.close >= item.sma;              
  });

  //console.log("\n \n stockData >> " + path +" >> "+result[0].timestamp);


  /* var stockData =response.data;

  //console.log("\n \n stockData >> " + JSON.stringify(stockData));


  stockData= stockData.map(x => 
  {
      var obj = x;
      obj.timestamp = new Date(obj.timestamp);

      //console.log("\n \n timestamp >> " +  obj.timestamp);
      return obj;
  });  
  var closeData = stockData.map(x => x.close);  
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

      var date = new Date(obj.timestamp);;

      //console.log("date " + date);

      if(obj.rsi >= 60 && date.getDay() == date.getDay() && date.getMonth()== date.getMonth())
      {
          log(obj.rsi);
      }
      if(obj.rsi >= 60 && stockData[index - 1].rsi < 60)
      {
          buyCall++;
          buyprice = x.close;
          isBuySignalGenerated = true;
          console.log("\n\n BUY *>> " + x.timestamp +" >> "+ buyprice);
      }
      else if(obj.rsi != 0 && obj.rsi <= 40 && stockData[index - 1].rsi > 40)
      {
          sellCall++;
          sellprice = x.close;
          isSellSignalGenerated = true;
          console.log("\n\n SELL *>> " + x.timestamp +" >> "+ sellprice);
      }
      
      if(isBuySignalGenerated)
      {
          if(obj.rsi < 60 || x.close < obj.sma)
          {
              isBuySignalGenerated = false;  
              profit = x.close - buyprice;
              totalProfit += profit;
              console.log("\n\n EXIT CALL *>> " + x.timestamp+" close >> "+x.close+" profit>> "+ profit+" totalProfit >> "+ totalProfit +">>"+ buyCall);
          }
      }else if(isSellSignalGenerated)
      {
          if(obj.rsi > 40 || x.close > obj.sma)
          {
              isSellSignalGenerated = false;  
              profit = sellprice - x.close;
              totalProfit += profit;
              console.log("\n\n EXIT SELL *>> " + x.timestamp+" close >> "+x.close+" profit>> "+ profit+" totalProfit >> "+ totalProfit +">>"+ sellCall);
          }
      } 
      index++;
      return obj;
  }); 
  console.log(stockData); */
}

var rsi:any,sma:any,bb:any;

function getList(list:any){ 
    for (let x of list) {
    //list.map(Object(x) => {
      if(x){

          var inputRSI:Object = {
              values : [],
              period : 14
          };
          rsi = new technicalindicators.RSI(inputRSI);
          var inputSMA:Object = {
              values : [],
              period : 20
          };
          sma= new technicalindicators.SMA(inputSMA);

          var inputBB:Object = {
              period : 14, 
              values : [],
              stdDev : 2 
          }
          bb = new technicalindicators.BollingerBands(inputBB);

          var symbol = x.symbol ? x.symbol:x;
          var path = 'data/stock/1day/'+symbol+'.txt';
          fs.access(path, fs.constants.F_OK | fs.constants.R_OK, (err:any) => {
              if (err) {
              console.error(
                  `${path} ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}`);
              } else {
              console.log(`${path} exists, and it is Readable`);

                  fs.readFile(path, 'utf8', function(err:any, response:any) {
                      if (err) throw err;
                      
                      if(response != '' && response != undefined && response != null){
                          var obj = JSON.parse(response);
                         
                          var df =  dataForge.fromJSON(JSON.stringify(obj.data)) // Read CSV file (or JSON!)
                         .dropSeries(["cp"]) // Drop certain columns.
                         .where(row => calculateIndicators(row)) // Filter rows.
                         .select(row => transform(row)); // Transform the data. 
                         
                         const chronoOrder = df.reverse();
                         var output = df.toJSON();
                         log("data >> " + path +" \ n \n "+ output);

                          /* const indexedDf = chronoOrder.setIndex("timestamp"); 
                          const close = indexedDf.getSeries("close"); 
                          dataFrame.plot().renderImage("my-chart.png"); */
                      } 
                  });
              }

          });

      

          
              }
          }  
}


function mappedFunction()
{
 
}

function transform(row:any)
{
  row.timestamp = new Date(row.timestamp);
  return row;
}

function searchPattern(row:any)
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
            var day:any = now.getDate();
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

function calculateIndicators(row:any)
{
  row.rsi = rsi.nextValue(Number(row.close));
  row.sma = sma.nextValue(Number(row.close));
  row.bb = bb.nextValue(Number(row.close)); 
  return row;
}

function log(message:any){

    if(process.env.NODE_ENV=="production")
        return;
        
    date = new Date();
   
    today = date.getDate() +"-"+(date.getMonth() +1)+"-"+date.getFullYear();
  
    var path = "logs/log-"+today+".txt";
    try {
        if (fs.existsSync(path)) {
            fs.appendFile(path, "\n"+date +" "+message, function (err:any) {
            if (err) throw err;
            }); 
        }else {
            fs.writeFile(path, "\n"+date +" "+message, function (err:any) {
                if (err) throw err;
            }); 
        }
    }    
    catch(err) {
        console.error(err);
        fs.writeFile(path, "\n"+date +" "+message, function (err:any) {
            if (err) throw err;
        }); 
    }    
}

function addIndicators(response:any,path:String){ 
  var stockData =response.data;
  //stockData=  //stockData.map(x => 

  for (let x of stockData) {
      var obj = x;
      obj.timestamp = new Date(obj.timestamp);
       return obj;
  }

  var closeData =[];// stockData.map(x => x.close);  
  for (let x of stockData) {
    closeData.push(x.close);
  }

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
  var BB = technicalindicators.BollingerBands;
  var period = 14;
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
  
  for (let x of stockData) {
  //stockData= stockData.map(x =>{
      var obj = x;
      obj.rsi = index > inputRSI.period?rsiData[index - inputRSI.period]:0;
      obj.sma = index >= inputSMA.period?smaData[index - inputSMA.period]:0;
      obj.bb = index >= inputBB.period?bbData[index - inputBB.period]:null;

      index++;
      //console.log("\nobj > " + JSON.stringify(obj));
      return obj;
  } 


  backTesting(stockData,path);
  //log(stockData);
}

var bankNiftyCall:any;
function checkBankNiftyExpiry()
{
      bankNiftyCall = new Object();

      fs.readFile('data/index/nse_fo.txt', function(err:any, response:any) {      
        var  data= JSON.parse(response).data;
        const transformedData = new dataForge.DataFrame(data)
        .where(row => searchPattern(row)) // Filter rows.
        .toArray();                        // Back to normal JavaScript data!.
   
       console.log("WATCH BANK NIFTY  ****** " + JSON.stringify(bankNiftyCall)); 
       log(" \n \n BANK NIFTY >> data >>" + transformedData);
    });
}