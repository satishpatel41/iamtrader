var cron = require('node-cron');
var chalk = require('chalk');
var list;
var moment = require('moment-timezone');
var now = new Date();
var india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
india.format();        
var end_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();
now.setDate(now.getDate() - 21);
india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
india.format(); 
var start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1)+"-"+india.year();

cron.schedule('*/2 * * * *', () => {
    //getAllLiveStrategy();
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/1 * * * *', () => {
    /* load5minData();
    load15minData();
    load30minData();
    load60minData(); */
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/3 * * * *', () => {
    console.log(chalk.blue('running a task every 3 minutes ' + new Date()));
    load3minData();
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/1 * * * *', () => {
  
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/5 * * * *', () => {
    console.log(chalk.blue('running a task every 5 minutes ' + new Date()));
    load5minData();
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/10 * * * *', () => {
    console.log(chalk.blue('running a task every 10 minutes ' + new Date()));
    load10minData();
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/15 * * * *', () => {
    console.log(chalk.blue('running a task every 15 minutes ' + new Date()));
    load15minData();   
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/30 * * * *', () => {
    console.log(chalk.blue('running a task every 30 minutes ' + new Date()));
    load30minData();
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('0 */1 * * *', () => {
    
    console.log(chalk.blue('running a task every 1 hour' + new Date()));
    load60minData();
    
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('59 23 * * *', () => {
    //console.log(chalk.yellow('Clean cache data'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});



// At 9:00 /autoLogin
cron.schedule('0 9 * * *', () => {
    console.log('Good morning : 9:00 autoLogin !');
    getAllLiveStrategy();
    autoLogin();    
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

// At 9:15 /trading Hours
cron.schedule('14 9 * * *', () => {
    isTradingHours = getTradingHours();
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

// At 3:15 /trading Hours
cron.schedule('30 15 * * *', () => {
    isTradingHours = getTradingHours();
 }, {
 scheduled: true,
 timezone: "Asia/Kolkata"
 });


// At 9:30
cron.schedule('31 9 * * *', () => {
    console.log('Good morning : 9:30 call');
    interval = '15MINUTE';

    /* Promise.all(open_low_high_List.map(async(strategy) =>{
        applyStrategy(watchList,interval,strategy); 
    })).then(function(result) {
        bollinger_open_List.map(async(strategy) =>{
            applyStrategy(watchList,interval,strategy); 
        });
        console.log('9:30 call result : ' + result);        
    }) */
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
    syncLiveAllStockData(watchList,interval,start_date,end_date);  
}

function load1dayData()
{
    interval = '1DAY';
    let promise = new Promise(function(resolve, reject) {
        const list = strategyList.filter(strategy => strategy.interval == '1DAY');
        syncLiveAllStockData(list,interval,start_date,end_date); 
        setTimeout(function() {
            resolve(1);
        },1000); 
    }).then(res=>{
        const list = strategyList.filter(strategy => strategy.interval == interval);
        console.log("1DAY strategy "  +list.length);
        applyStrategy(list,interval); 
        now = interval = india = start_date = null;
    }); 
}

function load60minData()
{
    now = new Date();
    now.setDate(now.getDate() - 6);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    const list = strategyList.filter(strategy => strategy.interval == '60MINUTE');
    if(list.length > 0)
        executeLiveStrategy(list);
}

function load30minData()
{ 
    now = new Date();
    now.setDate(now.getDate() - 6);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1) +"-"+india.year();
    interval = '30MINUTE';
    const list = strategyList.filter(strategy => strategy.interval == '30MINUTE');
    if(list.length > 0)
        executeLiveStrategy(list);  
}

function load10minData()
{
    interval = '10MINUTE';   
    now = new Date();
    now.setDate(now.getDate() - 6);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format();    
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1) +"-"+india.year(); 
    const list = strategyList.filter(strategy => strategy.interval == '10MINUTE');
    if(list.length > 0)
        executeLiveStrategy(list);
}

function load5minData()
{
    interval = '5MINUTE';
    now = new Date();
    now.setDate(now.getDate() - 6);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1) +"-"+india.year();
    const list = strategyList.filter(strategy => strategy.interval == '5MINUTE');
    if(list.length > 0)
        executeLiveStrategy(list);
}

function load3minData()
{
    //getAllLiveStrategy();
    interval = '3MINUTE';
    now = new Date();
    now.setDate(now.getDate() - 2);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format();     
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1) +"-"+india.year();

    isTradingHours = getTradingHours();
    
    //console.log("load3minData StrategyList > " + strategyList.length);   
    const list = strategyList.filter(strategy => strategy.interval == '3MINUTE');
    if(list.length > 0)
        executeLiveStrategy(list);
}

function load1minData()
{
    interval = '1MINUTE';
    now = new Date();
    now.setDate(now.getDate() - 2);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1) +"-"+india.year();

    let promise = new Promise(function(resolve, reject) {
        syncLiveAllStockData(indices,interval,start_date,end_date);
        syncLiveAllStockData(watchList,interval,start_date,end_date);
        is15MinDataSync = false;
        resolve(1);      
    }).then(res=>{
        getPercent_list(watchList);
        getGapUpDown(watchList);
        now = interval = india = start_date = null; 
    });
}

async function load15minData()
{   
    interval = '15MINUTE';
    now = new Date();
    now.setDate(now.getDate() - 6);
    india = moment.tz(now, 'DD-MM-YYYY HH:mm',"Asia/Kolkata");
    india.format(); 
    start_date = formatDate(india.date())+"-"+formatDate(india.month() + 1) +"-"+india.year();
    const list = strategyList.filter(strategy => strategy.interval == '15MINUTE');
    if(list.length > 0)
        executeLiveStrategy(list);
}