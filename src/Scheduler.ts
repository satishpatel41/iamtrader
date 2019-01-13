var cron = require('node-cron');
var list = fnoList;

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
    log('NSE 1 day data update');
    var list = niftyList;
    var now = new Date();
    now.setDate(now.getDate() - 21);
    
    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
    var interval = '1DAY';

    if(accessToken){    
        loadAllSymbolData(list,interval,start_date).then(function (response:any) {
            if(response.length > 0)
                 store.set('data1day', response); 
            
            list = now = interval = null;
        })
        .catch(function(error:any){
           log("load1dayData/ error > " +  JSON.stringify(error));
        });
    }   
}

function load60minData()
{
    log('NSE 60MINUTE data update');
    var list = niftyList;
    var now = new Date();
    //now.setMinutes(now.getMinutes() - 50 * 60);
    now.setDate(now.getDate() - 5);
  
    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
    var interval = '60MINUTE';
    if(accessToken){    
        loadAllSymbolData(list,interval,start_date).then(function (response:any) {
            if(response.length > 0)
                store.set('data60', response); 
            
            list = now = interval = null;
        })
        .catch(function(error:any){
           log("load60minData/ error > " +  JSON.stringify(error));
        });
    }   
}

function load30minData()
{ 
    log('NSE 30MINUTE data update');
    var list = niftyList;
    var now = new Date();
    //now.setMinutes(now.getMinutes() - 50 * 30);
    now.setDate(now.getDate() - 4);
  
    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
    var interval = '30MINUTE';
    if(accessToken){    
        loadAllSymbolData(list,interval,start_date).then(function (response:any) {
            if(response.length > 0)
                store.set('data30', response); 
            
            list = now = interval = null;
        })
        .catch(function(error:any){
           log("load30minData/ error > " +  JSON.stringify(error));
        });
    }    
}

function load10minData()
{
    log('NSE 10MINUTE data update');
    var list = niftyList;
    var interval = '10MINUTE';
    var now = new Date();
    //now.setMinutes(now.getMinutes() - 50 * 10);
    now.setDate(now.getDate() - 3);
   
    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();

    if(accessToken){    
        loadAllSymbolData(list,interval,start_date).then(function (response:any) {
            if(response.length > 0)
                 store.set('data10', response); 
            list = now = interval = null;
        })
        .catch(function(error:any){
            log("load10minData/ error > " +  JSON.stringify(error));
        });
    }    
}


function load5minData()
{
    log('NSE 5 MINUTE data update');
    var list = niftyList;
    var now = new Date();
    //now.setMinutes(now.getMinutes() - 50 * 5);
    now.setDate(now.getDate() - 3);

    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();

    var interval = '5MINUTE';
    if(accessToken){
        loadAllSymbolData(list,interval,start_date).then(function (response:any) {
            if(response.length > 0)
              store.set('data5', response); 
            
            list = now = interval = null;
            
        })
        .catch(function(error:any){
           log("load5minData/ error > " +  start_date +" >> "+JSON.stringify(error));
        });
    }    
}

function load3minData()
{
    log('NSE 3 MINUTE data update');
    var list = niftyList;
    var now = new Date();
    //now.setMinutes(now.getMinutes() - 50 * 3);
    now.setDate(now.getDate() - 3);

    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();

    var interval = '3MINUTE';
    if(accessToken){
        loadAllSymbolData(list,interval,start_date).then(function (response:any) {
            if(response.length > 0)
              store.set('data3', response); 
            
            list = now = interval = null;
            
        })
        .catch(function(error:any){
           log("load3minData/ error > " +  start_date +" >> "+JSON.stringify(error));
        });
    }    
}

function load15minData()
{
    log('NSE 15 MINUTE data update');
    var list = niftyList;
    var now = new Date();
    now.setMinutes(now.getMinutes() - 50 * 15);

    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();

    var interval = '15MINUTE';
    if(accessToken){
        loadAllSymbolData(list,interval,start_date).then(function (response:any) {
            if(response.length > 0)
              store.set('data15', response); 
            
            list = now = interval = null;
            
        })
        .catch(function(error:any){
           log("load15minData/ error > " +  start_date +" >> "+JSON.stringify(error));
        });
    }    
}