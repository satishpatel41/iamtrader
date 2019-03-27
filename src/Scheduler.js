var cron = require('node-cron');
var chalk = require('chalk');
var list;
var moment = require('moment-timezone');

cron.schedule('*/5 * * * *', () => {
   load5minData();
    console.log(chalk.blue('running a task every 5 minutes'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/10 * * * *', () => {
    //load10minData();
    console.log(chalk.blue('running a task every 10 minutes'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/15 * * * *', () => {
    load15minData();
    console.log(chalk.blue('running a task every 15 minutes'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});


cron.schedule('*/30 * * * *', () => {
   // load30minData();
    console.log(chalk.blue('running a task every 30 minutes'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('0 */1 * * *', () => {
    load60minData();
    console.log(chalk.blue('running a task every 1 hour'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('59 23 * * *', () => {
    store.unlink();
    console.log(chalk.yellow('Clean cache data'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('0 17 * * *', () => {
    load1dayData();
    console.log(chalk.blue('running a task every 1 day'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('0 17 * * *', () => {
    load1WeekData();
    console.log(chalk.blue('running a task every 1 day'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});



function load1WeekData()
{
    var list = niftyList;
    var now = new Date();
    var end_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
    now.setDate(now.getDate() - 5 * 200);
    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
    var interval = '1WEEK';
    if(store.get('accessToken')){    
        syncLiveAllStockData(watchList,interval,start_date,end_date); 
    }   
}

function load1dayData()
{
    var list = niftyList;
    var now = new Date();
    var end_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
    now.setDate(now.getDate() - 200);
    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
    var interval = '1DAY';
    if(store.get('accessToken')){    
        syncLiveAllStockData(watchList,interval,start_date,end_date); 
    }   
}

var now = new Date();
var india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
india.format(); 
            
var start_date = "";//india.date()+"-"+(india.month())+"-"+india.year();
now.setDate(now.getDate() - 15);
india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
india.format(); 
var end_date = "";//india.date()+"-"+(india.month())+"-"+india.year();

function load60minData()
{
    var interval = '60MINUTE';
    if(store.get('accessToken')){   
        syncLiveAllStockData(watchList,interval,start_date,end_date); 
    }   
}

function load30minData()
{ 
    var interval = '30MINUTE';
    if(store.get('accessToken')){    
        syncLiveAllStockData(watchList,interval,start_date,end_date); 
   }    
}

function load10minData()
{
     var interval = '10MINUTE';   
    if(store.get('accessToken')){    
      syncLiveAllStockData(watchList,interval,start_date,end_date); 
    }    
}

function load5minData()
{
     var interval = '5MINUTE';
    if(store.get('accessToken')){
        syncLiveAllStockData(watchList,interval,start_date,end_date); 
    } 
    getPercent_list(watchList);   

    strategyList.map(strategy =>{
        applyStrategy(watchList,'5MINUTE',strategy); 
    });
}

function load3minData()
{  
    var interval = '3MINUTE';
    if(store.get('accessToken')){
       syncLiveAllStockData(watchList,interval,start_date,end_date);       
    }    
}

function load15minData()
{   
    var interval = '15MINUTE';
    if(store.get('accessToken')){
        syncLiveAllStockData(watchList,interval,start_date,end_date);     
    }   
    //getPercent_list(watchList); 


    strategyList.map(strategy =>{
        applyStrategy(watchList,'15MINUTE',strategy); 
    });
    /* applyStrategy(watchList,'15MINUTE',strategy_bbLower); 
    applyStrategy(watchList,'15MINUTE',strategy_rsi60_crossed); 
    applyStrategy(watchList,'15MINUTE',strategy_bbUpper_band_crossed); 
    applyStrategy(watchList,'15MINUTE',strategy_bbLower); */ 
}