var cron = require('node-cron');
var chalk = require('chalk');
var list;
var moment = require('moment-timezone');


cron.schedule('*/5 * * * *', () => {
    //load5minData();
    console.log(chalk.blue('running a task every 5 minutes'));
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
    //load60minData();
    console.log(chalk.blue('running a task every 1 hour'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('59 23 * * *', () => {
    //store.unlink();
    //store.set('accessToken', ''); 
    //console.log(chalk.yellow('Clean cache data'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});
//9:30
cron.schedule('30 9 * * *', () => {
//cron.schedule('30 14 * * *', () => {
    console.log('Good morning : 9:30 call');
    var interval = '15MINUTE';

    Promise.all(open_band_List.map(async(strategy) =>{
            applyStrategy(watchList,'15MINUTE',strategy); 
    })).then(function(result) {
        console.log('9:30 call result : ' + result);        
    })
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
    //if(store.get('accessToken')){    
        syncLiveAllStockData(watchList,interval,start_date,end_date); 
    //}   
}



function load1dayData()
{
    var list = niftyList;
    var now = new Date();
    var india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata"); 
    var end_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();
    now.setDate(now.getDate() - 25);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    var start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();


    var interval = '1DAY';
    //if(store.get('accessToken')){    
        syncLiveAllStockData(watchList,interval,start_date,end_date); 
    //}   
}

var now = new Date();
var india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
india.format(); 
            
var end_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();
now.setDate(now.getDate() - 6);
india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
india.format(); 
var start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();//india.date()+"-"+(india.month())+"-"+india.year();

function load60minData()
{
    queue.empty();
    var interval = '60MINUTE';
    //if(store.get('accessToken')){   
        //syncLiveAllStockData(watchList,interval,start_date,end_date); 
    //}   
}

function load30minData()
{ 
    queue.empty();
    var interval = '30MINUTE';
    //if(store.get('accessToken')){    
        //syncLiveAllStockData(watchList,interval,start_date,end_date); 
   //}    
}

function load10minData()
{
    queue.empty();
     var interval = '10MINUTE';   
    //if(store.get('accessToken')){    
      //syncLiveAllStockData(watchList,interval,start_date,end_date); 
    //}    
}

function load5minData()
{
    var interval = '15MINUTE';
    queue.empty();

    let promise = new Promise(function(resolve, reject) {
        syncLiveAllStockData(watchList,interval,start_date,end_date);
        setTimeout(function() {
            resolve(1);
        }, 10000);      
    }).then(res=>{
        //console.log("load15minData - Process p  " + res);
        return Number(res) + 1;
    });

    promise.then(function(result)  {
        strategyList.map(strategy =>{
            applyStrategy(watchList,'15MINUTE',strategy); 
        });
        //console.log("load15minData " + result);
        return Number(result) + 1;
    });

    promise.then(function(result)  {
        getPercent_list(watchList);
        //console.log("load15minData  " + result);
    });
}


function load15minData()
{   
    var interval = '15MINUTE';
    queue.empty();

    let promise = new Promise(function(resolve, reject) {
        syncLiveAllStockData(watchList,interval,start_date,end_date);
        setTimeout(function() {
            resolve(1);
        }, 10000);      
    }).then(res=>{
        //console.log("load15minData - Process p  " + res);
        return Number(res) + 1;
    });

    promise.then(function(result)  {
        strategyList.map(strategy =>{
            applyStrategy(watchList,'15MINUTE',strategy); 
        });
       // console.log("load15minData " + result);
        return Number(result) + 1;
    });

    promise.then(function(result)  {
        getPercent_list(watchList);
       // console.log("load15minData  " + result);
    });
}