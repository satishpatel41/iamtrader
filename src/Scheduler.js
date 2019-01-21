var cron = require('node-cron');
var chalk = require('chalk');
var list;// = fnoList;

cron.schedule('*/3 * * * *', () => {
    load3minData();
    console.log(chalk.blue('running a task every 3 minutes'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/5 * * * *', () => {
    load5minData();
    console.log(chalk.blue('running a task every 5 minutes'));
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});

cron.schedule('*/10 * * * *', () => {
    load10minData();
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
    load30minData();
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

function load1dayData()
{
    var list = niftyList;
    var now = new Date();
    now.setDate(now.getDate() - 21);
    
    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
    var interval = '1DAY';

    if(store.get('accessToken')){    
        loadAllSymbolData(list,interval,start_date).then(function (response) {
            if(response.length > 0)
                 store.set('data1day', response); 
            
            list = now = interval = null;
            console.log('NSE 1 day data update');
        })
        .catch(function(error){
            console.log("load1dayData/ error > " +  JSON.stringify(error));
        });
    }   
}

function load60minData()
{
    var list = niftyList;
    var now = new Date();
    now.setDate(now.getDate() - 5);
  
    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
    var interval = '60MINUTE';
    if(store.get('accessToken')){    
        loadAllSymbolData(list,interval,start_date).then(function (response) {
            if(response.length > 0)
                store.set('data60', response); 
            
            list = now = interval = null;
            console.log('NSE 60MINUTE data update');
        })
        .catch(function(error){
            console.log("load60minData/ error > " +  JSON.stringify(error));
        });
    }   
}

function load30minData()
{ 
    var list = niftyList;
    var now = new Date();
    now.setDate(now.getDate() - 4);
  
    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
    var interval = '30MINUTE';
    if(store.get('accessToken')){    
        loadAllSymbolData(list,interval,start_date).then(function (response) {
            if(response.length > 0)
                store.set('data30', response); 
            
            list = now = interval = null;
            console.log('NSE 30MINUTE data update');
    
        })
        .catch(function(error){
            console.log("load30minData/ error > " +  JSON.stringify(error));
        });
    }    
}

function load10minData()
{
    var list = niftyList;
    var interval = '10MINUTE';
    var now = new Date();
    now.setDate(now.getDate() - 3);
   
    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();

    if(store.get('accessToken')){    
        loadAllSymbolData(list,interval,start_date).then(function (response) {
            if(response.length > 0)
                 store.set('data10', response); 
            list = now = interval = null;
            console.log('NSE 10MINUTE data update');
    
        })
        .catch(function(error){
            console.log("load10minData/ error > " +  JSON.stringify(error));
        });
    }    
}


function load5minData()
{
    var list = niftyList;
    var now = new Date();
    now.setDate(now.getDate() - 3);

    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();

    var interval = '5MINUTE';
    if(store.get('accessToken')){
        loadAllSymbolData(list,interval,start_date).then(function (response) {
            if(response.length > 0)
              store.set('data5', response); 
            
            list = now = interval = null;
            console.log('NSE 5 MINUTE data update');
        })
        .catch(function(error){
            console.log("load5minData/ error > " +  start_date +" >> "+JSON.stringify(error));
        });
    }    
}

function load3minData()
{
    
    var list = niftyList;
    var now = new Date();
    //now.setMinutes(now.getMinutes() - 50 * 3);
    now.setDate(now.getDate() - 3);

    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();

    var interval = '3MINUTE';
    if(store.get('accessToken')){
        loadAllSymbolData(list,interval,start_date).then(function (response) {
            if(response.length > 0)
              store.set('data3', response); 
            
            console.log('NSE 3 MINUTE data update');
            list = now = interval = null;
            
        })
        .catch(function(error){
            console.log("load3minData/ error > " +  start_date +" >> "+JSON.stringify(error));
        });
    }    
}

function load15minData()
{
    
    var list = niftyList;
    var now = new Date();
    now.setDate(now.getDate() - 3);

    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();

    var interval = '15MINUTE';
    if(store.get('accessToken')){
        loadAllSymbolData(list,interval,start_date).then(function (response) {
            if(response.length > 0)
              store.set('data15', response); 
            
            list = now = interval = null;
            console.log('NSE 15 MINUTE data update');
            
        })
        .catch(function(error){
            console.log("load15minData/ error > " +  start_date +" >> "+JSON.stringify(error));
        });
    }    
}