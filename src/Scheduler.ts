var schedule = require('node-schedule');
var list = nseSymbolList;
var stockObj = {data60:[], data30:[], data10:[],data5:[]};

var j = schedule.scheduleJob('0 18 * * *', function(){
    log('Daily data update');
});
   

var j = schedule.scheduleJob('*/60 * * * *', function(){
    log('NSE 60MINUTE data update');
    var now = new Date();
    now.setMinutes(now.getMinutes() - 20 * 60);
    var start_date = now.getDate()+"-"+now.getMonth+"-"+now.getFullYear();
    var interval = '60MINUTE';
    loadAllSymbolData(list,interval,start_date).then(function (response:any) {
        stockObj.data60 = response.data;
        log('*** NSE 60 MINUTE *** \n ' + JSON.stringify(response));
    })
    .catch(function(error:any){
       log("loadAllSymbolData/ error > " +  JSON.stringify(error));
    });
});

var j = schedule.scheduleJob('*/30 * * * *', function(){
    log('NSE 30MINUTE data update');
    var now = new Date();
    now.setMinutes(now.getMinutes() - 50 * 30);
    var start_date = now.getDate()+"-"+now.getMonth+"-"+now.getFullYear();
    var interval = '30MINUTE';
    loadAllSymbolData(list,interval,start_date).then(function (response:any) {
        stockObj.data30 = response.data;
        log('*** NSE 30 MINUTE *** \n ' + JSON.stringify(stockObj));
    })
    .catch(function(error:any){
       log("loadAllSymbolData/ error > " +  JSON.stringify(error));
    });
});

    
var j = schedule.scheduleJob('*/10 * * * *', function(){
    log('NSE 10MINUTE data update');
    var interval = '10MINUTE';
    var now = new Date();
    now.setMinutes(now.getMinutes() - 50 * 10);
    var start_date = now.getDate()+"-"+now.getMonth+"-"+now.getFullYear();

    loadAllSymbolData(list,interval,start_date).then(function (response:any) {
        stockObj.data10 = response.data;
        log('*** NSE 10 MINUTE *** \n ' + JSON.stringify(response));
    })
    .catch(function(error:any){
       log("loadAllSymbolData/ error > " +  JSON.stringify(error));
    });
});

   
var j = schedule.scheduleJob('*/5 * * * *', function(){
    log('NSE 5 MINUTE data update');
    var now = new Date();
    now.setMinutes(now.getMinutes() - 50 * 5);
    var start_date = now.getDate()+"-"+now.getMonth+"-"+now.getFullYear();

    var interval = '5MINUTE';
    loadAllSymbolData(list,interval,start_date).then(function (response:any) {
        stockObj.data5 = response.data;
        log('*** NSE 5 MINUTE *** \n ' + JSON.stringify(response));
        
    })
    .catch(function(error:any){
       log("loadAllSymbolData/ error > " +  JSON.stringify(error));
    });
});