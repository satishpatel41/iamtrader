var cron = require('node-cron');
var chalk = require('chalk');
var list;
var moment = require('moment-timezone');
var ping = require('ping');
var hosts = ['robo-trader.herokuapp.com', 'https://robo-trader.herokuapp.com/'];

var now = new Date();
var india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
india.format(); 
            
var end_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();
now.setDate(now.getDate() - 21);
india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
india.format(); 
var start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();

cron.schedule('*/1 * * * *', () => {
    load1minData();
    console.log(chalk.blue('running a task every 1 minutes ' + new Date()));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/3 * * * *', () => {
    //load3minData();
    console.log(chalk.blue('running a task every 3 minutes ' + new Date()));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/5 * * * *', () => {
    load5minData();
    console.log(chalk.blue('running a task every 5 minutes ' + new Date()));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/10 * * * *', () => {
    //load10minData();
    console.log(chalk.blue('running a task every 10 minutes ' + new Date()));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/16 * * * *', () => {
    load15minData();
    console.log(chalk.blue('running a task every 15 minutes ' + new Date()));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});


cron.schedule('*/45 * * * *', () => {
    hosts.forEach(function (host) {
        ping.promise.probe(host)
            .then(function (res) {
                console.log(res);
            });
    });

     console.log(chalk.blue('Ping --- every 45 minutes' + new Date()));
 }, {
 scheduled: true,
 timezone: "Asia/Kolkata"
 });


cron.schedule('*/30 * * * *', () => {
   load30minData();
    console.log(chalk.blue('running a task every 30 minutes' + new Date()));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('0 */1 * * *', () => {
    load60minData();
    console.log(chalk.blue('running a task every 1 hour' + new Date()));
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


// At 9:30
cron.schedule('30 9 * * *', () => {
    console.log('Good morning : 9:30 call');
    interval = '15MINUTE';

    Promise.all(open_low_high_List.map(async(strategy) =>{
        applyStrategy(watchList,interval,strategy); 
    })).then(function(result) {
        open_band_List.map(async(strategy) =>{
            applyStrategy(watchList,interval,strategy); 
        });
        console.log('9:30 call result : ' + result);        
    })
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('0 18 * * *', () => {
    load1dayData();
    console.log(chalk.blue('running a task every 1 day'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('0 19 * * *', () => {
    load1WeekData();
    console.log(chalk.blue('running a task every 1 day'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

function load1WeekData()
{
    interval = '1WEEK';
    if(accessToken)
    syncLiveAllStockData(watchList,interval,start_date,end_date);  
}

function load1dayData()
{
    interval = '1DAY';
    if(accessToken)
    syncLiveAllStockData(watchList,interval,start_date,end_date);  
}


function load60minData()
{
    //queue.empty();
    now = new Date();
    now.setDate(now.getDate() - 2);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();

    interval = '60MINUTE';
    if(accessToken)
    syncLiveAllStockData(watchList,interval,start_date,end_date); 
}

function load30minData()
{ 
    //queue.empty();
    now = new Date();
    now.setDate(now.getDate() - 2);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();

    interval = '30MINUTE';
    if(accessToken)
    syncLiveAllStockData(watchList,interval,start_date,end_date);   
}

function load10minData()
{
    //queue.empty();
    interval = '10MINUTE';   
    now = new Date();
    now.setDate(now.getDate() - 2);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();//india.date()+"-"+(india.month())+"-"+india.year();
    if(accessToken)
    syncLiveAllStockData(watchList,interval,start_date,end_date);   
}

function load5minData()
{
    interval = '5MINUTE';
    //queue.empty();
    now = new Date();
    now.setDate(now.getDate() - 1);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();//india.date()+"-"+(india.month())+"-"+india.year();

    let promise = new Promise(function(resolve, reject) {
        if(accessToken)
        syncLiveAllStockData(watchList,interval,start_date,end_date);
        resolve(1);    
    }).then(res=>{
        getPercent_list(watchList);
    });
   
}

function load3minData()
{
    interval = '3MINUTE';
    //queue.empty();
    now = new Date();
    now.setDate(now.getDate() - 1);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();
    let promise = new Promise(function(resolve, reject) {
        if(accessToken)
        syncLiveAllStockData(watchList,interval,start_date,end_date);
        resolve(1);     
    }).then(res=>{
        return Number(res) + 1;
        getPercent_list(watchList);
    });
}

function load1minData()
{
    interval = '1MINUTE';
    //queue.empty();
    now = new Date();
    now.setDate(now.getDate() - 1);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();//india.date()+"-"+(india.month())+"-"+india.year();

    let promise = new Promise(function(resolve, reject) {
        if(accessToken)
             syncLiveAllStockData(indices,interval,start_date,end_date);
             syncLiveAllStockData(watchList,interval,start_date,end_date);
        resolve(1);      
    }).then(res=>{
        getPercent_list(watchList);
        return Number(res) + 1;
    });
}

function load15minData()
{   
    interval = '15MINUTE';
    //queue.empty();
    now = new Date();
    now.setDate(now.getDate() - 1);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();
    let promise = new Promise(function(resolve, reject) {
        if(accessToken)
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