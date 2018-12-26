var schedule = require('node-schedule');
var list = niftyList;
var stockObj = {data1day:[],data60:[], data30:[], data10:[],data5:[]};

var j = schedule.scheduleJob('0 18 * * *', function(){
    load1dayData();
});
   

var j = schedule.scheduleJob('*/60 * * * *', function(){
    load60minData();
});

var j = schedule.scheduleJob('*/30 * * * *', function(){
    load30minData();
});

    
var j = schedule.scheduleJob('*/10 * * * *', function(){
    load10minData();
});
 
var j = schedule.scheduleJob('*/5 * * * *', function(){
    load5minData();
});


function load1dayData()
{
    log('NSE 1 day data update');
    var list = nseSymbolList;
    var now = new Date();
    now.setDate(now.getDate() - 21);
    var start_date = now.getDate()+"-"+(now.getMonth()+1)+"-"+now.getFullYear();
    var interval = '1day';
    loadAllSymbolData(list,interval,start_date).then(function (response:any) {
        stockObj.data1day = response;
        log('*** NSE 1 day *** \n ' + JSON.stringify(stockObj));
    })
    .catch(function(error:any){
       log("loadAllSymbolData/ error > " +  JSON.stringify(error));
    });
}

function load60minData()
{
    log('NSE 60MINUTE data update');
    var list = nseSymbolList;
    var now = new Date();
    now.setMinutes(now.getMinutes() - 50 * 60);
    var start_date = now.getDate()+"-"+(now.getMonth()+1)+"-"+now.getFullYear();
    var interval = '60MINUTE';
    loadAllSymbolData(list,interval,start_date).then(function (response:any) {
        stockObj.data60 = response;
        log('*** NSE 60 MINUTE *** \n ' + JSON.stringify(stockObj));
    })
    .catch(function(error:any){
       log("loadAllSymbolData/ error > " +  JSON.stringify(error));
    });
}

function load30minData()
{ 
    log('NSE 30MINUTE data update');
    var list = nseSymbolList;
    var now = new Date();
    now.setMinutes(now.getMinutes() - 50 * 30);
    var start_date = now.getDate()+"-"+(now.getMonth()+1)+"-"+now.getFullYear();
    var interval = '30MINUTE';
    loadAllSymbolData(list,interval,start_date).then(function (response:any) {
        stockObj.data30 = response;
        log('*** NSE 30 MINUTE *** \n ' + JSON.stringify(stockObj));
    })
    .catch(function(error:any){
       log("loadAllSymbolData/ error > " +  JSON.stringify(error));
    });
}

function load10minData()
{
    log('NSE 10MINUTE data update');
    var list = nseSymbolList;
    var interval = '10MINUTE';
    var now = new Date();
    now.setMinutes(now.getMinutes() - 50 * 10);
    var start_date = now.getDate()+"-"+(now.getMonth()+1)+"-"+now.getFullYear();

    loadAllSymbolData(list,interval,start_date).then(function (response:any) {
        stockObj.data10 = response;
        log('*** NSE 10 MINUTE *** \n ' + JSON.stringify(stockObj));
    })
    .catch(function(error:any){
       log("loadAllSymbolData/ error > " +  JSON.stringify(error));
    });
}


function load5minData()
{
    log('NSE 5 MINUTE data update');
    var list = nseSymbolList;
    var now = new Date();
    now.setMinutes(now.getMinutes() - 50 * 5);
    var start_date = now.getDate()+"-"+(now.getMonth()+1)+"-"+now.getFullYear();

    var interval = '5MINUTE';
    loadAllSymbolData(list,interval,start_date).then(function (response:any) {
        stockObj.data5 = response;
        //log('*** NSE 5 MINUTE *** \n ' + JSON.stringify(response));
        log('*** NSE 5 MINUTE *** \n ' + JSON.stringify(stockObj));
        
    })
    .catch(function(error:any){
       log("loadAllSymbolData/ error > " +  JSON.stringify(error));
    });
}