var express = require('express');

var compression = require('compression')
var moment = require('moment-timezone');
var bodyParser = require('body-parser');
var chalk = require('chalk');
var fs = require('fs');
var url = require('url');
var cluster = require('cluster');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var Store = require('data-store');
var async = require('async');
const querystring = require('querystring');
var store = new Store({ path: 'config.json' });
var Upstox = require("upstox");
var api = "OknufM07tm1g9EfN4fHKP2Eqi9DSw40I2Y3xliHg";
var upstox = new Upstox(api);
const PORT = process.env.PORT || 3000;
var redirect_uri = "http://localhost:"+PORT;

if(process.env.NODE_ENV=="production")
{
    api = "OknufM07tm1g9EfN4fHKP2Eqi9DSw40I2Y3xliHg";
    redirect_uri = "https://robo-trader.herokuapp.com/";
}



var numReqs = 0; 
if (cluster.isMaster) {
  // Fork workers.
  let cpus = 1;//require('os').cpus().length;
  console.log(chalk.green("cpus "  +cpus));
  for (var i = 0; i < cpus; i++) {
    var worker = cluster.fork();
 
    worker.on('message', function(msg) {
     /*  if (msg.cmd && msg.cmd == 'notifyRequest') {
        numReqs++;
      } */
    });
  }
 
  cluster.on('death', function(worker) {
    console.log(chalk.red('worker ' + worker.pid + ' died'));
  });
} else {
        var app = express();
        app.use(express.static('public'));
        // compress all responses
        app.use(compression());
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
                    maxAge: 1000 * 60 * 60 * 8//24
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
        
      
       
        app.get('/', function (req, res) {
            var q = url.parse(req.url, true).query;
            code = q.code;

            console.log(chalk.green("session > " + JSON.stringify(req.session.cookie)));
            getAcceToken(code);        
            res.sendFile("index.html", {"root": __dirname});
            //checkBankNiftyExpiry();

            /* if(code)
            {
                getAcceToken(code);        
                res.sendFile("index.html", {"root": __dirname});
            }
            else{
                res.sendFile("index.html", {"root": __dirname});
            } */
            q = null;
    });

    app.get('/welcome', checkSignIn,function (req, res) {
        res.send('<b>Hello</b> welcome to my http server made with express');
    });

    app.get('/login', function (req, res) {
        res.sendFile("login.html", {"root": __dirname});
    });

    app.get('/logout', function(req, res){
         req.session.destroy(function(){
            console.log(chalk.blue("user logged out."));
        });
        res.redirect('/login');
    });

    function checkSignIn(req, res,next){
        if(req.session.user){
            next();     //If session exists, proceed to page
        } else {
            //var err = new Error("Not logged in!");
            console.log(chalk.blue(JSON.stringify(req.session) +" session \n"+  req.session.user));
            res.sendFile("login.html", {"root": __dirname});
        }       
    }

    app.post('/login', function (req, res) {
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
                   // console.log(chalk.green("Login token > " + store.get('accessToken')));
                    /* if(store.get('accessToken') && store.get('accessToken') != '')
                    { */
                        req.session.user = user;
                        res.send(user);
                   /*  }
                    else{
                        var loginUrl = upstox.getLoginUri(redirect_uri);
                        res.status(200).header('Content-type', 'text/html');
                        //code = req.params.code;
                        //res.status(302).setHeader('Location', loginUrl);
                        //res.end();
                    } */
                }
            });     
    }
    else
        res.sendFile("login.html", {"root": __dirname});
    });

    app.get('/signup', function (req, res) {
        res.sendFile("signup.html", {"root": __dirname});
    });

    app.get('/gainerLoser', function (req, res) {
        res.sendFile("gainerloser.html", {"root": __dirname});
    });

    app.get('/api/gainerLoser', function (req, res) {
        res.send(store.get('percentage'));
    });

    
    app.post('/signup', function (req, res) {
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

    app.get('/contactus', checkSignIn,function (req, res) {
        res.sendFile("contactus.html", {"root": __dirname});
    });

    app.get('/index', checkSignIn,function (req, res) {
        res.sendFile("index.html", {"root": __dirname});
    });

    app.get('/scan', checkSignIn,function (req, res) {
        res.sendFile("scanner.html", {"root": __dirname});
    });

    app.get('/strategy', checkSignIn,function (req, res) {
        res.sendFile("strategy.html", {"root": __dirname});
    });

    app.get('/gainerloser', checkSignIn,function (req, res) {
        res.sendFile("gainerloser.html", {"root": __dirname});
    });

    var  lastObject = {open:'',close:'',low:'',high:'',volume:'',timestamp:'',rsi:'',sma:'',bb:{upper:'',lower:'',isCrossed:'',middel:'',pb:''}};
    var stockData = [];

    app.post('/createStrategy',checkSignIn, function (req, res) {
        var strategyObj = JSON.parse(req.body.data);

        var uid = strategyObj.uid;
        var name = strategyObj.name;
        var symbol= strategyObj.symbol;
        var exchange = strategyObj.exchange;
        var orderType = strategyObj.orderType;
        var symbolToBuySell  = strategyObj.symbolToBuySell;
        var interval = strategyObj.interval;
        
        var query = "INSERT INTO Strategy (uid,name,symbol,exchange,orderType,symbolToBuySell,interval)VALUES(?,?,?,?,?,?,?)";
        var param = [uid,name,symbol,exchange,orderType,symbolToBuySell,interval];
        
        insertDB(query,param).then(responses => {
          
            if(responses == 'success')
            {
                var query1 = "select sid from Strategy where uid=?";
                var param1 = [uid];

                getFirst(query1,param1).then(obj => {
                    //console.log("result > " + obj.sid);
                    if(obj.sid == undefined)
                    {
                        res.send("error")
                    }
                    else{
                        console.log(obj.sid);
                         var sid = obj.sid;
                        strategyObj.indicators.map(async (obj) => {

                            var indicator= obj.indicator;
                            var settings = obj.settings;
                            var value = obj.value;
                            var op = obj.op;
                            
                            var q = "INSERT INTO Indicators (sid,indicator,settings,value,op)VALUES(?,?,?,?,?)";
                            var p = [sid,indicator,settings,value,op];
                            //console.log(q +"> "+ JSON.stringify(p));

                            insertDB(q,p).then(responses => {
                                console.log("result > " + JSON.stringify(responses));
                            }); 
                        });

                        res.send('success');
                       
                    }
                });  
            }
            else{
                res.send("error");
            }
        });

        var now = new Date();
        if(interval == "5MINUTE") 
                now.setDate(now.getDate() - 2);
        else if(interval == "3MINUTE")
            now.setDate(now.getDate() - 1);
        else if(interval == "15MINUTE")
             now.setDate(now.getDate() - 2);
        else if(interval == "10MINUTE")
                now.setDate(now.getDate() - 3);
        else if(interval == "30MINUTE")
            now.setDate(now.getDate() - 4);
        else if(interval == "60MINUTE")
            now.setDate(now.getDate() - 4);
        else if(interval == "1DAY")
            now.setDate(now.getDate() - 20);
        else if(interval == "1WEEK")
            now.setDate(now.getDate() - 7*20);
        else if(interval == "1MONTH")
            now.setMonth(now.getMonth() - 20);   
        
        var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();

        initiateIndicator();
        stockData = [];
        loadSymbol(strategyObj.symbol,strategyObj.exchange,interval,start_date).then(function (response) {
            res.setHeader('Content-Type', 'application/json');
            stockData =response.data;
            
            lastObject = {open:'',close:'',low:'',high:'',volume:'',timestamp:'',rsi:'',sma:'',bb:{upper:'',lower:'',isCrossed:'',middel:'',pb:''}};
            stockData.map(row => {
                var india = moment.tz(new Date(Number(row.timestamp)), "Asia/Kolkata");
                india.format(); 
                row.timestamp = india.date() +"/"+(india.month()+1) +"/"+india.year()+" "+india.hour()+":"+india.minute();//new Date(row.timestamp);
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
                        console.log(chalk.red(err));
                        err = null;
                    });
            } 

            console.log("Result " + JSON.stringify(data));
            res.send(JSON.stringify(data));
            stockData = null;
            res.end();
        })
        .catch(function(error){
            console.log("createStrategy error > " +  JSON.stringify(error));
            error = null;
        });

    });

    app.get('/loadSymbol/:symbol/:interval',checkSignIn, function (req, res) { 
        console.log('params: ' + JSON.stringify(req.params));
     
        var symbol = req.params.symbol;  
        var interval = req.params.interval; 

        var now = new Date();
        if(interval == "5MINUTE") // 1WEEK, 1MONTH
            now.setMinutes(now.getMinutes() - 5* 20);
        else if(interval == "3MINUTE")
            now.setMinutes(now.getMinutes() - 3 * 20);
        else if(interval == "10MINUTE")
            now.setMinutes(now.getMinutes() - 10 * 20);
        else if(interval == "15MINUTE")
            now.setMinutes(now.getMinutes() - 15 * 20);    
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
        console.log("start_date > " + interval +" >> "+start_date);
        
        var inputRSI = {
            values : [],
            period : 14
        };
        var rsi = new technicalindicators.RSI(inputRSI);
        var inputSMA = {
            values : [],
            period : 20
        };
        //console.log("rsi");
        var sma= new technicalindicators.SMA(inputSMA);

        var inputBB = {
            period : 14, 
            values : [],
            stdDev : 2 
        }
        //console.log("sma");
        var bb = new technicalindicators.BollingerBands(inputBB);
        inputBB = inputRSI = inputSMA = null;

        stockData = [];
        loadSymbol(symbol,"NSE_EQ",interval,start_date).then(function (response) {
            res.setHeader('Content-Type', 'application/json');
            stockData =response.data;
            //console.log("loadSymbol stockData : " + response);
            lastObject = {open:'',close:'',low:'',high:'',volume:'',timestamp:'',rsi:'',sma:'',bb:{upper:'',lower:'',isCrossed:'',middel:'',pb:''}};
            stockData.map(row => {
                var india = moment.tz(new Date(Number(row.timestamp)), "Asia/Kolkata");
                india.format(); 
               // row.timestamp = india.date() +"/"+(india.month()+1) +"/"+india.year()+" "+india.hour()+":"+india.minute();//new Date(row.timestamp);
                row.rsi = rsi.nextValue(Number(row.close));
                row.sma = sma.nextValue(Number(row.close));
                row.bb = bb.nextValue(Number(row.close)); 
                if(row && row.bb && Number(row.close) >= Number(row.bb.upper))// && Number(lastObject.close) < Number(lastObject.bb.upper))
                {
                    row.bb.isCrossed = 'Crossed Above';
                }
                else if(row && row.bb && Number(row.close) <= Number(row.bb.lower))// && Number(lastObject.close) > Number(lastObject.bb.lower))
                {
                    row.bb.isCrossed = 'Crossed Below';
                }
                
                lastObject = row;
                return row;
            });
            stockData.reverse();
            res.send(JSON.stringify(stockData));
            stockData = null;
            res.end();
        })
        .catch(function(error){
            if(error.code == 401){
               // accessToken = '';
               // store.set('accessToken', accessToken); 

                var loginUrl = upstox.getLoginUri(redirect_uri);
                res.status(200).header('Content-type', 'text/html');
                code = req.params.code;
                res.status(302).setHeader('Location', loginUrl);
                res.end();
                error = loginUrl = null;
            }
            console.log("/loadSymbol/:symbol/:interval error > " +  JSON.stringify(error));
        });

    });

    function initiateIndicator()
    {
        //console.log("initiateIndicator");
        var inputRSI = {
            values : [],
            period : 14
        };
        rsi = new technicalindicators.RSI(inputRSI);
        var inputSMA = {
            values : [],
            period : 20
        };
        //console.log("rsi");
        sma= new technicalindicators.SMA(inputSMA);

        var inputBB = {
            period : 14, 
            values : [],
            stdDev : 2 
        }
        //console.log("sma");
        bb = new technicalindicators.BollingerBands(inputBB);
        inputBB = inputRSI = inputSMA = null;
    }

    app.get('/getFutureContract/:exchange', checkSignIn,function (req, res) { 
    var exchange = req.params.exchange;  

    //console.log("getMaster exchange > " +  JSON.stringify(exchange));

    fs.readFile('data/index/nse_fo.txt','utf8', function(err, response) {
        
        var obj = JSON.parse(response);
       /*  var now = new Date();
        var thisMonth = months[now.getMonth()].slice(0,3).toUpase();
        var monthPattern = new RegExp(thisMonth, 'gi'); */
            
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


    /* getMaster(exchange).then(function (response) {

        console.log("getMaster respone > " +  JSON.stringify(response));


        var data = response.filter(function (el) {
            return (el != null && el.close != null && el.close != undefined && el.close != "");
        });

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
        exchange =  data = null;
        res.end();
    })
    .catch(function(error){
        log("getMaster/ error > " +  JSON.stringify(error));
    }); */

    });
    
    app.get('/getStockIndicators/:symbol/:interval', checkSignIn,function (req, res) { 
        var symbol = req.params.symbol;  
        var interval = req.params.interval;  
        
        new Promise(function(resolved, rejected) {
            var data = getStock(symbol,interval);    
            resolved(data); 
        }).then(stockData => {
            var inputRSI = {
                values : [],
                period : 14
            };
            rsi = new technicalindicators.RSI(inputRSI);
            var inputSMA = {
                values : [],
                period : 20
            };    
            sma= new technicalindicators.SMA(inputSMA);
            
            var inputBB = {
                period : 14, 
                values : [],
                stdDev : 2 
            }
         
            bb = new technicalindicators.BollingerBands(inputBB);
            inputBB = inputRSI = inputSMA = null;
            var data = [];
            try{
                data = JSON.parse(stockData.data); 
                data.map(row => {
                    row.rsi = rsi.nextValue(Number(row.close));
                    row.sma = sma.nextValue(Number(row.close));
                    row.bb = bb.nextValue(Number(row.close));                
                    
                    return row;
                });
                data.reverse();          
                res.setHeader('Content-Type', 'application/json');
            }
            catch(e){
                console.log(e);
            }
            res.send(JSON.stringify(data));
            exchange = list = interval =  null;
            res.end();                    
            
        })
        .catch();

    });
    
    app.get('/getDefaultIndicators/:interval/:exchange', checkSignIn,function (req, res) { 
        var interval = req.params.interval;  
        var exchange = req.params.exchange;  

        var list = [];
        //if(exchange == "nifty")
            list =  store.get('niftyList');
        /* else if(exchange == "fno")
            list = store.get('fnoList');
        else
            list = store.get('nseSymbolList'); */


        Promise.all(list.map(async (x) =>  {
            var symbol = x.symbol ? x.symbol:x;    
            return getStock(symbol,interval);          
            })).then(stockData => {
                var inputRSI = {
                    values : [],
                    period : 14
                };
                rsi = new technicalindicators.RSI(inputRSI);
                var inputSMA = {
                    values : [],
                    period : 20
                };
                //console.log("rsi");
                sma= new technicalindicators.SMA(inputSMA);
        
                var inputBB = {
                    period : 14, 
                    values : [],
                    stdDev : 2 
                }
                //console.log("sma");
                bb = new technicalindicators.BollingerBands(inputBB);
                inputBB = inputRSI = inputSMA = null;

                var arr = stockData.map(async (dataObj) =>  {
                    try{
                        var data = JSON.parse(dataObj.data); 

                        data.map(row => {
                            var india = moment.tz(new Date(Number(row.timestamp)), "Asia/Kolkata");
                            india.format(); 
                            row.timestamp = india.date() +"/"+(india.month()+1) +"/"+india.year()+" "+india.hour()+":"+india.minute();//new Date(row.timestamp);
                            row.rsi = rsi.nextValue(Number(row.close));
                            row.sma = sma.nextValue(Number(row.close));
                            row.bb = bb.nextValue(Number(row.close)); 
                            
                            lastObject = row;
                            return row;
                        });
                        data.reverse();
                        var resonseData = {
                            "symbol":dataObj.symbol,
                            "close":data[0].close,
                            "volume":data[0].volume,
                            "rsi":data[0].rsi,
                            "timestamp":data[0].timestamp,
                            "sma":data[0].sma, 
                            "bb":data[0].bb
                        }; 
                        return resonseData;
                      
                    }
                    catch(e){
                        console.log("stockData.map Error " + e);
                    }
                });    
                
                Promise.all(arr)
                    .then(resonse=>
                    {
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(resonse));
                        exchange = list = interval =  null;
                        res.end();
                    })
                    .catch();
            })
            .catch(error => { 
                console.log(error)
            }); 

    });



    var result = [];
    var map = new Map();

    app.get('/loadAllSymbolData/:interval/:exchange', checkSignIn,function (req, res) { 
        console.log('params: ' + JSON.stringify(req.params));
        
        var interval = req.params.interval;  
        var exchange = req.params.exchange;  

        var list = [];
        if(exchange == "nifty")
            list =  store.get('niftyList');//niftyList;
        else if(exchange == "fno")
            list = store.get('fnoList');//fnoList;
        else{
            list = store.get('nseSymbolList');
        }

        var stockData = [];
        if(interval == "5MINUTE") 
            stockData =store.get('data5');
        else if(interval == "3MINUTE")
            stockData =store.get('data3');
        else if(interval == "10MINUTE")
            stockData =store.get('data10');
        else if(interval == "15MINUTE")
            stockData =store.get('data15');    
        else if(interval == "30MINUTE")
            stockData =store.get('data30');
        else if(interval == "60MINUTE")
            stockData = store.get('data60');
        else if(interval == "1DAY")
            stockData = store.get('data1day');         
        else if(interval == "1WEEK")
            stockData = store.get('data1week');       
        else if(interval == "1MONTH")
            stockData = store.get('data1month');        

        var data = [];
        if(stockData && stockData != undefined && stockData.length > 0)
        {
            stockData.filter(function (el) {
                return (el != null && el.close != null && el.close != undefined && el.close != "");
            });
        }
            
        //console.log('*stockData interval : ' +interval +">"+ stockData.length);
        if(stockData && stockData.length > 0 && stockData[0])
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(stockData));
            res.end();
        }
        else{ 
            console.log('*No data available '+ interval+' Fetch it.');
            
            var now = new Date();
            if(interval == "5MINUTE")
                    now.setDate(now.getDate() - 2);
            else if(interval == "3MINUTE")
                    now.setDate(now.getDate() - 2);
            else if(interval == "10MINUTE")
                    now.setDate(now.getDate() - 3); 
            else if(interval == "15MINUTE")
                    now.setDate(now.getDate() - 3);               
            else if(interval == "30MINUTE")
                now.setDate(now.getDate() - 4);
            else if(interval == "60MINUTE")
                now.setDate(now.getDate() - 4);
            else if(interval == "1DAY")
                now.setDate(now.getDate() - 30);
            else if(interval == "1WEEK")
                now.setDate(now.getDate() - 7*20);
            else if(interval == "1MONTH")
                now.setMonth(now.getMonth() - 20);    
            
            var start_date = now.getDate()+"-"+(now.getMonth() + 1)+"-"+now.getFullYear();
                
            //console.log("start_date :: "+interval +"> "+start_date);
            loadAllSymbolData(list,interval,start_date).then(function (response) {
                console.log("\n loadAllSymbolData **"+JSON.stringify(response));
                var data = [];
            
                if(interval == "5MINUTE")
                {
                    store.set('data5', response); 
                }
                else if(interval == "3MINUTE"){
                    store.set('data3', response); 
                }
                else if(interval == "10MINUTE"){
                    store.set('data10', response); 
                }
                else if(interval == "15MINUTE"){
                    store.set('data15', response); 
                }
                else if(interval == "30MINUTE"){
                    store.set('data30', response); 
                }
                else if(interval == "60MINUTE"){
                    store.set('data60', response); 
                }
                else if(interval == "1DAY"){
                    store.set('data1day', response); 
                } 
                else if(interval == "1WEEK"){
                    store.set('data1week', response); 
                } 
                else if(interval == "1MONTH"){
                    store.set('data1month', response); 
                } 
                        
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(response));
                exchange = list = interval = data = null;
                res.end();
            })
            .catch(function(error){
                console.log("loadAllSymbolData/ error > " +  JSON.stringify(error));
            });
        }
    });

    app.get('/getListOfAllSymbol', checkSignIn,function (req, res) {   
        res.setHeader('Content-Type', 'application/json');
        
        fnoList =  store.get('fnoList');
        if(fnoList && fnoList.length > 0)
            res.send(JSON.stringify(fnoList));
        else
            res.send(JSON.stringify(getListOfAllSymbol()));
            
        res.end();
    });

    

    app.get('/getBalance', function (req, res) {   
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(balance));
        res.end();
    });

    app.get('/getProfile', function (req, res) {   
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(profile));
        res.end();
    });

    app.post('/scan', function (req, res) {

    });

 /*    const requestLogs = [];
    app.get('/heapdump', checkSignIn,function (req, res) {
        heapdump.writeSnapshot((err, filename) => {
            console.log('Heap dump written to', filename)
        });
        requestLogs.push({ url: req.url, date: new Date() });
    res.end(JSON.stringify(requestLogs));
    }); */

    app.get('/admin', checkSignIn,function (req, res) {
        var india = moment.tz(store.get('tokenValidity'),"Asia/Kolkata");
        var d =new Date();
        var now1 = moment.tz(d, 'YYYY-DD-MM HH:mm',"Asia/Kolkata");
        now1.format(); 
        console.log("tokenValidity "  +now1 +":"+india+":"+ india.isBefore(now1));
        if(india.isBefore(now1))
        {
            //accessToken = '';
           // store.set('accessToken',accessToken)
        }

        /* if(store.get('accessToken') && store.get('accessToken') != ''){
             accessToken = store.get('accessToken');
             upstox.setToken(accessToken);
             getListOfAllSymbol();
             res.sendFile("index.html", {"root": __dirname});
        }
        else{ */
            var loginUrl = upstox.getLoginUri(redirect_uri);
            console.log("*loginUri " + loginUrl);
            res.status(200).header('Content-type', 'text/html');
            code = req.params.code;
            res.status(302).setHeader('Location', loginUrl);
            res.end();
        //}
    });

    // Change the 404 message modifing the middlewar
    app.use(function(req, res, next) {
        res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
    });

    // start the server in the port 3000 !
    app.listen(PORT, function () {
    console.log('App listening on port '+PORT);
   // console.log(`Heapdump enabled. Run "kill -USR2 ${process.pid}" or send a request to "/heapdump" to generate a heapdump.`);
    });
}

// Listen for dying workers
cluster.on('exit', function (worker) {

    // Replace the dead worker,
    // we're not sentimental
    console.log('Worker %d died :(', worker.id);
    cluster.fork();

});
