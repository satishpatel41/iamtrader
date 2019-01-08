var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var url = require('url');
var cluster = require('cluster');
const dataForge = require('data-forge');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

const Store = require('data-store');
const store = new Store({ path: 'config.json' });


require('data-forge-fs');
var Upstox = require("upstox");
var api:string = "cIs71szuLZ7WFKInU8O0o7GTHm5QIJke8ahnzLVw";
var upstox = new Upstox(api);
//var redis = require('redis');
//var client = redis.createClient({host: process.env.REDIS_HOST || '127.0.0.1'});
/* var client = redis.createClient({host : 'localhost', port : 6379});
client.on('connect', function() {
    console.log('connected');
}); */
const PORT = process.env.PORT || 8080;
var redirect_uri = "http://localhost:"+PORT;
var nifty = "https://www.nseindia.com/content/indices/ind_nifty50list.csv";
var fno = "https://www.nseindia.com/content/fo/fo_mktlots.csv";
if(process.env.NODE_ENV=="production")
{
    api = "cIs71szuLZ7WFKInU8O0o7GTHm5QIJke8ahnzLVw";
    redirect_uri = "https://robo-trader.herokuapp.com/";
}



var numReqs = 0;
 
if (cluster.isMaster) {
  // Fork workers.
  let cpus = require('os').cpus().length;
  console.log("cpus "  +cpus);
  for (var i = 0; i < cpus; i++) {
    var worker = cluster.fork();
 
    worker.on('message', function(msg) {
     /*  if (msg.cmd && msg.cmd == 'notifyRequest') {
        numReqs++;
      } */
    });
  }
 
  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
  });
} else {
        // Worker processes have a http server.
        
        var app = express();
        app.use(express.static('public'));
        app.use(bodyParser.json()); // support json encoded bodies
        app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        app.use(session(
            {
                store: new FileStore({
 
                    path: './session-store'
         
                }),
                name: '_fs_cookie', // cookie will show up as foo site
                resave: false,
                saveUninitialized: false,
                secret: "00777",
                cookie: {
                    maxAge: 1000 * 60 * 60 * 24
                }
            }    
            ));
    
        app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        var date = new Date();
        var today = date.getDate() +"-"+(date.getMonth() + 1) +"-"+date.getFullYear();
        var time = date +":"+date.getHours() +":"+date.getMinutes();   
        var fnoArr=  dataForge.readFileSync("data/list/fo_mktlots.csv")
        .parseCSV()
        .toArray();

        var fnoList = [];
        fnoArr.forEach(function(item) {   
        if(item.Symbol)
            fnoList.push(item.Symbol)
        //else
          //  fnoList.push(item.SYMBOL)
        });

        var niftyList =  dataForge.readFileSync("data/list/ind_nifty50list.csv")
        .parseCSV()
        .toArray();

        niftyList = niftyList.map(x => x.Symbol);
        //console.log("Res niftyList" + niftyList);

        app.get('/', function (req:any, res:any) {
        var q = url.parse(req.url, true).query;
        code = q.code;

       /*  var hour = 3600000;
        req.session.cookie.expires = new Date(Date.now() + hour);
        req.session.cookie.maxAge = hour; */
        console.log("session > " + JSON.stringify(req.session.cookie));


        /* if(req.session.page_views){
            req.session.page_views++;
            console.log("page > " + req.session.page_views);
            } else {
            req.session.page_views = 1;
        } */

        //checkBankNiftyExpiry();
        //res.send('<b>My code </b>  : ' + code);

        if(code)
        {
            getAcceToken(code);        
            res.sendFile("index.html", {"root": __dirname});
        }
        else{
            res.sendFile("index.html", {"root": __dirname});
        }
        q = null;
    });

    app.get('/welcome', checkSignIn,function (req:any, res:any) {
        res.send('<b>Hello</b> welcome to my http server made with express');
    });

    app.get('/login', function (req:any, res:any) {
        res.sendFile("login.html", {"root": __dirname});
    });

    app.get('/logout', function(req, res){
         req.session.destroy(function(){
            console.log("user logged out.")
        });
        res.redirect('/login');
    });

    function checkSignIn(req, res,next){

        if(req.session.user){
            next();     //If session exists, proceed to page
        } else {
            //var err = new Error("Not logged in!");
            console.log(JSON.stringify(req.session) +" session \n"+  req.session.user);
            res.sendFile("login.html", {"root": __dirname});
        }       
    }

    app.post('/login', function (req:any, res:any) {
    var email = req.body.username;
    var psw = req.body.password;

    if(email){
        var query = "select * from User where email=? and password=?";
        var param = [email,psw];
        getFirst(query,param).then(user => {
                console.log("result > " + JSON.stringify(user));
                if(user == undefined)
                {
                    res.send("error")
                }
                else{
                    //client.set('user', user);

                    req.session.user = user;
                    res.send(user);
                }
            });     
    }
    else
        res.sendFile("login.html", {"root": __dirname});
    });

    app.get('/signup', function (req:any, res:any) {
        res.sendFile("signup.html", {"root": __dirname});
    });

    app.post('/signup', function (req:any, res:any) {
        var email = req.body.email;
        var psw = req.body.psw;
        var mobile = req.body.mobile;
        var name = req.body.name;
        var pswRepeat = req.body.pswRepeat;

        if(email)
        {
            var query = "select * from User where email=?";
            var param = [email];
            var isMatchEmail = false;
            getFirst(query,param).then(user => {
                    console.log("result > " + JSON.stringify(user));
                    if(user == undefined)
                    {
                        //Do nothing
                    }
                    else{
                        res.send("error");
                        isMatchEmail = true;
                    }
                });

                var query = "INSERT INTO User (name,mobile,email,password)VALUES(?,?,?,?)";
                var param = [name,mobile,email,psw];
                console.log(query +"> "+ param);
                
                if(!isMatchEmail){  
                    insertDB(query,param).then(responses => {
                        console.log("result > " + JSON.stringify(responses));

                        if(responses == 'success')
                        {
                            res.send('success');
                        }
                        else{
                            res.send("error");
                        }
                    });
            }    
            //res.send('<b>username </b>  : ' + email +" > "+ mobile+" > "+ name+" > "+ psw);
        }
        else
            res.sendFile("signup.html", {"root": __dirname});
    });

    app.get('/contactus', checkSignIn,function (req:any, res:any) {
        res.sendFile("contactus.html", {"root": __dirname});
    });

    app.get('/index', checkSignIn,function (req:any, res:any) {
        res.sendFile("index.html", {"root": __dirname});
    });

    app.get('/scan', checkSignIn,function (req:any, res:any) {
        res.sendFile("scanner.html", {"root": __dirname});
    });

    app.get('/strategy', checkSignIn,function (req:any, res:any) {
        res.sendFile("strategy.html", {"root": __dirname});
    });

    app.get('/gainerloser', checkSignIn,function (req:any, res:any) {
        res.sendFile("gainerloser.html", {"root": __dirname});
    });

    var  lastObject = {open:'',close:'',low:'',high:'',volume:'',timestamp:'',rsi:'',sma:'',bb:{upper:'',lower:'',isCrossed:'',middel:'',pb:''}};
    var stockData = [];

    app.post('/createStrategy', function (req:any, res:any) {
        var strategyObj = JSON.parse(req.body.data);

        var uid = strategyObj.uid;
        var name = strategyObj.name;
        var symbol= strategyObj.symbol;
        var exchange = strategyObj.exchange;
        var orderType = strategyObj.orderType;
        var symbolToBuySell  = strategyObj.symbolToBuySell;
        var indicator= strategyObj.indicators[0].indicator;
        var settings = strategyObj.indicators[0].settings;
        var value = strategyObj.indicators[0].value;
        var op = strategyObj.indicators[0].op;
        var interval = strategyObj.interval;

        var query = "INSERT INTO Strategy (uid,name,symbol,exchange,orderType,symbolToBuySell,indicator,settings,value,op,interval)VALUES(?,?,?,?,?,?,?,?,?,?,?)";
        var param = [uid,name,symbol,exchange,orderType,symbolToBuySell,indicator,settings,value,op,interval];
        console.log(query +"> "+ JSON.stringify(param));

        insertDB(query,param).then(responses => {
            console.log("result > " + JSON.stringify(responses));

            if(responses == 'success')
            {
                res.send('success');
            }
            else{
                res.send("error");
            }
        });



        //var interval = strategyObj.interval;
        var now = new Date();
        if(interval == "5MINUTE") // 1WEEK, 1MONTH
                now.setDate(now.getDate() - 2);//now.setMinutes(now.getMinutes() - 5 * 20);
        else if(interval == "10MINUTE")
                now.setDate(now.getDate() - 3);//now.setMinutes(now.getMinutes() - 10 * 20);
        else if(interval == "30MINUTE")
            now.setDate(now.getDate() - 4);//now.setMinutes(now.getMinutes() - 30* 20);
        else if(interval == "60MINUTE")
            now.setDate(now.getDate() - 4);//now.setMinutes(now.getMinutes() - 60* 20);
        else if(interval == "1DAY")
            now.setDate(now.getDate() - 20);
        else if(interval == "1WEEK")
            now.setDate(now.getDate() - 7*20);
        else if(interval == "1MONTH")
            now.setMonth(now.getMonth() - 20);    

        var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();

        initiateIndicator();
        stockData = [];
        loadSymbol(strategyObj.symbol,strategyObj.exchange,interval,start_date).then(function (response:any) {
            res.setHeader('Content-Type', 'application/json');
            stockData =response.data;
            
            lastObject = {open:'',close:'',low:'',high:'',volume:'',timestamp:'',rsi:'',sma:'',bb:{upper:'',lower:'',isCrossed:'',middel:'',pb:''}};
            stockData.map(row => {
                row.timestamp = new Date(row.timestamp);
                row.rsi = rsi.nextValue(Number(row.close));
                row.sma = sma.nextValue(Number(row.close));
                row.bb = bb.nextValue(Number(row.close)); 
                
                lastObject = row;
                return row;
            });
            stockData.reverse();
            var data = {
                "symbol":strategyObj.symbol,
                "close":stockData[0].close,
                "volume":stockData[0].volume,
                "rsi":stockData[0].rsi,
                "timestamp":stockData[0].timestamp,
                "sma":stockData[0].sma, 
                "bb":stockData[0].bb
            }; 

            var isMatch = false;
            
            for(var i=0;i<strategyObj.indicators.length;i++)
            {
                var op = strategyObj.indicators[i]['op'];
                var a = data[strategyObj.indicators[i]['indicator']];
                var b = strategyObj.indicators[i]['value'];
                var result = false;
                if(op == '<')
                    result = (a < b);
                else if(op == '>')
                    result = (a > b);   
                else if(op == '<=')
                    result = (a <= b);
                else if(op == '>=')
                    result = (a >= b);    
                    else if(op == '==')
                    result = (a == b);        
                
                if(result)
                {
                    isMatch = true;
                }
                console.log("isMatch :> " + isMatch);
            }
            
            if(isMatch){
                    var orderObject = {
                        transaction_type:strategyObj.orderType,
                        exchange:strategyObj.exchange,
                        symbol: strategyObj.symbolToBuySell,
                        quantity: 1,
                        order_type:"m"
                    };
                
                    upstox.placeOrder(orderObject).then(function(response) {
                        // Order details received
                        console.log(response);
                    })
                    .catch(function(err) {
                        // Something went wrong.
                        console.log(err);
                    });
            } 

            console.log("Result " + JSON.stringify(data));
            res.send(JSON.stringify(data));
            stockData = null;
            res.end();
        })
        .catch(function(error:any){
            log("createStrategy error > " +  JSON.stringify(error));
        });

    });

    app.get('/loadSymbol/:symbol/:interval', function (req:any, res:any) { 
    var symbol = req.params.symbol;  
    var interval = req.params.interval; 

    var now = new Date();
    if(interval == "5MINUTE") // 1WEEK, 1MONTH
        now.setMinutes(now.getMinutes() - 5* 20);
    else if(interval == "10MINUTE")
        now.setMinutes(now.getMinutes() - 10 * 20);
    else if(interval == "30MINUTE")
        now.setMinutes(now.getMinutes() - 30* 20);
    else if(interval == "60MINUTE")
        now.setMinutes(now.getMinutes() - 60* 20);
    else if(interval == "1DAY")
        now.setDate(now.getDate() - 20);
    else if(interval == "1WEEK")
        now.setDate(now.getDate() - 7*20);
    else if(interval == "1MONTH")
        now.setMonth(now.getMonth() - 20);  
    else 
        now.setDate(now.getDate() - 20);  

    var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
    //console.log("start_date > " + interval +" >> "+start_date);
    initiateIndicator();
    stockData = [];
    loadSymbol(symbol,'nse_eq',interval,start_date).then(function (response:any) {
        res.setHeader('Content-Type', 'application/json');
        stockData =response.data;
        //console.log(stockData);
        lastObject = {open:'',close:'',low:'',high:'',volume:'',timestamp:'',rsi:'',sma:'',bb:{upper:'',lower:'',isCrossed:'',middel:'',pb:''}};
        stockData.map(row => {
            row.timestamp = new Date(row.timestamp);
            row.rsi = rsi.nextValue(Number(row.close));
            row.sma = sma.nextValue(Number(row.close));
            row.bb = bb.nextValue(Number(row.close)); 
            
            /*  if(Number(row.close) >= row.bb.upper && Number(lastObject.close) < Number(lastObject.bb.upper))
            {
                row.bb.isCrossed = 'Crossed Above';
            }
            else if(Number(row.close) <= row.bb.lower && Number(lastObject.close) > Number(lastObject.bb.lower))
            {
                row.bb.isCrossed = 'Crossed Below';
            }
            lastObject = row; */
            return row;
        });
        stockData.reverse();
        res.send(JSON.stringify(stockData));
        stockData = null;
        res.end();
    })
    .catch(function(error:any){
        log("/loadSymbol/:symbol/:interval error > " +  JSON.stringify(error));
    });

    });


    function initiateIndicator()
    {
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
    inputBB = inputRSI = inputSMA = null;
    }


    app.get('/getFutureContract/:exchange', function (req:any, res:any) { 
    var exchange = req.params.exchange;  

    //console.log("getMaster exchange > " +  JSON.stringify(exchange));

    fs.readFile('data/index/nse_fo.txt','utf8', function(err, response) {
        
        var obj = JSON.parse(response);
        var now = new Date();
        var thisMonth = months[now.getMonth()].slice(0,3).toUpperCase();
        var monthPattern = new RegExp(thisMonth, 'gi');
            
        var data=csvTojs(obj.data);
        //console.log(data);
        var data = data.filter(x => (String(x.instrument_type) === exchange));
        
        //console.log(data);
        var arr = data.map(x => x.symbol);
        //console.log(arr);

        //console.log(arr);
        res.setHeader('Content-Type', 'application/json');
        res.send(arr);
        res.end();
    });


    /* getMaster(exchange).then(function (response:any) {

        console.log("getMaster respone > " +  JSON.stringify(response));


        var data = response.filter(function (el) {
            return (el != null && el.close != null && el.close != undefined && el.close != "");
        });

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
        exchange =  data = null;
        res.end();
    })
    .catch(function(error:any){
        log("getMaster/ error > " +  JSON.stringify(error));
    }); */

    });


    var result = [];
    var map = new Map();

    app.get('/loadAllSymbolData/:interval/:exchange', function (req:any, res:any) { 
    var interval = req.params.interval;  
    var exchange = req.params.exchange;  

    var list = [];
    if(exchange == "nifty")
        list = niftyList;
    else if(exchange == "fno")
        list = fnoList;
    else{
        //nseSymbolList = nseSymbolList.slice(1, 200);
        list = nseSymbolList;
    }

    var stockData = [];
    //console.log('*** NSE stockData *** \n ' + JSON.stringify(stockObj));
    if(interval == "5MINUTE") // 1WEEK, 1MONTH
        stockData =store.get('data5');//stockObj.data5;
    else if(interval == "10MINUTE")
        stockData =store.get('data10');//stockObj.data10;
    else if(interval == "30MINUTE")
        stockData =store.get('data30');//stockObj.data30;
    else if(interval == "60MINUTE")
        stockData = store.get('data60');//stockObj.data60;  
    else if(interval == "1DAY")
        stockData = store.get('data1day');//stockObj.data1day;             
    else if(interval == "1WEEK")
        stockData = store.get('data1week');//stockObj.data1day;             
    else if(interval == "1MONTH")
        stockData = store.get('data1month');//stockObj.data1day;             


    var data = stockData.filter(function (el) {
        return (el != null && el.close != null && el.close != undefined && el.close != "");
    });
            
    if(data.length > 0)
    {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data));
        res.end();
    }
    else{ 
        console.log('*No data available.. Fetch it : ' + interval);
        //console.log( JSON.stringify(store.get('data1day')));
        

        var now = new Date();
        if(interval == "5MINUTE") // 1WEEK, 1MONTH
                now.setDate(now.getDate() - 2);//now.setMinutes(now.getMinutes() - 5 * 20);
        else if(interval == "10MINUTE")
                now.setDate(now.getDate() - 3);//now.setMinutes(now.getMinutes() - 10 * 20);
        else if(interval == "30MINUTE")
            now.setDate(now.getDate() - 4);//now.setMinutes(now.getMinutes() - 30* 20);
        else if(interval == "60MINUTE")
            now.setDate(now.getDate() - 4);//now.setMinutes(now.getMinutes() - 60* 20);
        else if(interval == "1DAY")
            now.setDate(now.getDate() - 20);
        else if(interval == "1WEEK")
            now.setDate(now.getDate() - 7*20);
        else if(interval == "1MONTH")
            now.setMonth(now.getMonth() - 20);    
        
        var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();

        loadAllSymbolData(list,interval,start_date).then(function (response:any) {
            
            var data = response.filter(function (el) {
                return (el != null && el.close != null && el.close != undefined && el.close != "");
            });

            if(interval == "5MINUTE") // 1WEEK, 1MONTH
            {
                //stockObj.data5 =data;
                //client.set("data5", response);
                //req.session.data5 =data;
                store.set('data5', data); 
            }
            else if(interval == "10MINUTE"){
                //stockObj.data10 =data;
                //client.set("data10", response);
                //req.session.data10 =data;
                store.set('data10', data); 
            }
            else if(interval == "30MINUTE"){
                //stockObj.data30 =data;
                //client.set("data30", response);
                //req.session.data30 =data;
                store.set('data30', data); 
            }
            else if(interval == "60MINUTE"){
                //stockObj.data60 =data; 
                //client.set("data60", response);
                //req.session.data60 =data;
                store.set('data60', data); 
            }
            else if(interval == "1DAY"){
                //stockObj.data1day =data; 
                //client.set("data1day", response);  
                //req.session.data1day =data;
                store.set('data1day', data); 
            } 
            else if(interval == "1WEEK"){
                //stockObj.data1day =data; 
                //client.set("data1day", response);  
                //req.session.data1day =data;
                store.set('data1week', data); 
            } 
            else if(interval == "1MONTH"){
                //stockObj.data1day =data; 
                //client.set("data1day", response);  
                //req.session.data1day =data;
                store.set('data1month', data); 
            } 


            result = [];
            map = new Map();
            for (const item of response) {
                if(!map.has(item.symbol)){
                    map.set(item.symbol, true);    // set any value to Map
                    result.push(item);
                }
            }
                    
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
            exchange = list = interval = data = null;
            res.end();
        })
        .catch(function(error:any){
            log("loadAllSymbolData/ error > " +  JSON.stringify(error));
        });
    }
    });

    app.get('/getListOfAllSymbol', function (req:any, res:any) {   
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(fnoList));
        res.end();
    });

    app.get('/sync', function (req:any, res:any) {   
        syncStockData();
        res.setHeader('Content-Type', 'application/json');
        res.send("Successfully sync data !");
        res.end();
    });

    app.get('/getBalance', function (req:any, res:any) {   
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(balance));
        res.end();
    });

    app.get('/getProfile', function (req:any, res:any) {   
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(profile));
    res.end();
    });

    app.post('/scan', function (req:any, res:any) {

    });

    app.get('/admin', function (req:any, res:any) {
        var loginUrl = upstox.getLoginUri(redirect_uri);
        log("*loginUri " + loginUrl);
        res.status(200).header('Content-type', 'text/html');
        code = req.params.code;
        res.status(302).setHeader('Location', loginUrl);
        res.end();
    });

    // Change the 404 message modifing the middleware
    app.use(function(req:any, res:any, next:any) {
        res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
    });

    // start the server in the port 3000 !
    app.listen(PORT, function () {
    log('App listening on port '+PORT);
    });

}

// Listen for dying workers
cluster.on('exit', function (worker) {

    // Replace the dead worker,
    // we're not sentimental
    console.log('Worker %d died :(', worker.id);
    cluster.fork();

});






