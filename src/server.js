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
var store = new Store({ path: 'store.json' });
const PORT = process.env.PORT || 3000;
var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var date = new Date();
var __dirname = "views"
var exchanges =  [ 'MCX_FO', 'BSE_EQ', 'NSE_EQ', 'NSE_FO', 'NCD_FO'];
var today = date.getDate() +"-"+(date.getMonth() + 1) +"-"+date.getFullYear();
var time = date +":"+date.getHours() +":"+date.getMinutes();   
var fs = require('fs');
var events = require('events');
var eventEmitter = new events.EventEmitter();
eventEmitter.setMaxListeners(100000)
var is15MinDataSync = false;
var nseSymbolList = [];
var isTradingHours = getTradingHours();

/* var numReqs = 0; 
if (cluster.isMaster) {
  // Fork workers.
  let cpus = 1;//require('os').cpus().length;
  console.log(chalk.green("cpus "  +cpus));
  for (var i = 0; i < cpus; i++) {
    var worker = cluster.fork();
 
    worker.on('message', function(msg) {
    
    });
  }
 
  cluster.on('death', function(worker) {
    console.log(chalk.red('worker ' + worker.pid + ' died'));
  });
} else { */
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
                maxAge: 1000 * 60 * 60 * 10 * 15  
            }
        }    
    ));

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

  
    var callBackCount = 0;
    app.get('/callback', function (req, res) {
        var q = url.parse(req.url, true).query;
        var code = q.code;
        console.log("** code > " +callBackCount +" > "+ code + " > " + upstoxObjList);
        upstoxObjList[callBackCount]['traderObject'].getUpstoxAccessToken(code);
       // getAllData();
        q = null;
        callBackCount++;
    });
  
    app.get('/manualLogin/:your_api_key/:api_secret', function (req, res) {
        var your_api_key = req.params.your_api_key;  
        var api_secret = req.params.api_secret;  
        var userObj = {};
        userObj.your_api_key = your_api_key;
        userObj.api_secret = api_secret;
        userObj.traderObject = {};

        var up = new UpstoxBroker(your_api_key,api_secret,false);
        currentUserObj= userObj.traderObject = up;
        userObjList[index] = userObj;
        currentUserObj.traderObject = up;
        upstoxObjList.push(currentUserObj);
        res.send(up.loginUrl);
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
        
        var query = "select uid,name,isSuperAdmin,isVerified from User where email=? and password=?";
        var param = [email,psw];
        getFirst(query,param).then(user => {
                //console.log("result > " + JSON.stringify(user));
                if(user == undefined)
                {
                    res.send("error")
                }
                else{
                        req.session.user = user;
                        res.send(user);
                   
                }
            });     
    }
    else
        res.sendFile("login.html", {"root": __dirname});
    });

    app.post('/api/updateProfile',checkSignIn, function (req, res) {
        var profileObj = JSON.parse(req.body.data);
        
        //console.log("profileObj > " + JSON.stringify(profileObj));
        var name = profileObj.name;
        var mobile = profileObj.mobile;
        var email = profileObj.email;
        var your_api_key = profileObj.your_api_key;
        var your_redirect_uri = profileObj.your_redirect_uri;
        var user = profileObj.user;
        var broker_password = profileObj.broker_password;
        var password2f = profileObj.password2f;
        var api_secret = profileObj.api_secret;
        var isFullyAutomated = profileObj.isFullyAutomated;
        var uid = profileObj.uid;
        
       
        var query = "UPDATE User SET name = ?,mobile = ?,email = ?,your_api_key = ?,your_redirect_uri =?,user = ?,broker_password = ?,password2f = ?,api_secret = ?,isFullyAutomated = ? WHERE uid = ?";
        var param = [name,mobile,email,your_api_key,your_redirect_uri,user,broker_password,password2f,api_secret,isFullyAutomated,uid];
        
        updateDB(query,param).then(response => {
            if(response == 'success')
            {
                res.send('success');        
            }
            else{
                res.send("error");
            }
        });
    });



    app.get('/api/getProfile/:id', checkSignIn,function (req, res) { 
        var id = req.params.id;  
         if(id){
            var query = "select name, mobile, email,isVerified,isSuperAdmin,your_api_key,your_redirect_uri,user,broker_password,password2f,api_secret,isFullyAutomated from User where uid=?";
            var param = [id];
            getFirst(query,param).then(user => {
                //console.log("result > " + JSON.stringify(user));
                if(user == undefined)
                {
                    res.send("error")
                }
                else{
                        req.session.user = user;
                        res.send(user);
                    
                }
            });     
        }
        else
            res.sendFile("login.html", {"root": __dirname});
    });

    app.get('/signup', function (req, res) {
        res.sendFile("signup.html", {"root": __dirname});
    });

    app.get('/profile', function (req, res) {
        res.sendFile("profile.html", {"root": __dirname});
    });

    app.get('/gainerLoser', function (req, res) {
        res.sendFile("gainerloser.html", {"root": __dirname});
    });


    app.get('/gapupdown', function (req, res) {
        res.sendFile("gapUpDown.html", {"root": __dirname});
    });


    app.get('/index', function (req, res) {
        res.sendFile("index.html", {"root": __dirname});
    });
   // app.get('/api/gainerLoser', function (req, res) {

    
    app.get('/api/gapupdown/:exchange', checkSignIn,function (req, res) { 
        var exchange = req.params.exchange;  
        var list = [];
        if(exchange == "nifty")
            list =  nifty;
        else if(exchange == "fno")
            list = fno;
        else
            list = nse; 
           
        var response = store.get('gap').filter(isMatching);
        function isMatching(sItem) {
            var isMatch = false;
            for (var i = 0; i < list.length; i++) {
               
                if(list[i] == sItem.symbol){
                    isMatch = true;
                    break;
                }
            }
            return isMatch;
        }
       
          
        var filteredResponse = response.filter(isBigGap);
        res.send(filteredResponse);
        response =filteredResponse = list= exchange = null;
        res.end();
    });

    function isBigGap(value) {
        return value.gap > 1 || value.gap < -1;
      }

    app.get('/api/gainerLoser/:exchange', checkSignIn,function (req, res) { 
        var exchange = req.params.exchange;  
        var list = [];
        if(exchange == "nifty")
            list =  nifty;
        else if(exchange == "fno")
            list = fno;
        else
            list = nse; 
           
        var response = store.get('percentage').filter(isMatching);
        function isMatching(sItem) {
            var isMatch = false;
            for (var i = 0; i < list.length; i++) {
               
                if(list[i] == sItem.symbol){
                    isMatch = true;
                    break;
                }
            }
            return isMatch;
        }
       
        res.send(response);
        response =list= exchange = null;
        res.end();
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
                    //console.log("result > " + JSON.stringify(user));
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
                        //console.log("result > " + JSON.stringify(responses));

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

    app.get('/allCharts', checkSignIn,function (req, res) {
        res.sendFile("allStockCharts.html", {"root": __dirname});
    });

    app.get('/applyStrategy', checkSignIn,function (req, res) {
        res.sendFile("applyStrategy.html", {"root": __dirname});
    });

    

    app.get('/chart', checkSignIn,function (req, res) {
         res.sendFile("chart.html", {"root": __dirname});      
    });

    app.get('/scanner', checkSignIn,function (req, res) {
        res.sendFile("scanner.html", {"root": __dirname});
    });

    app.get('/strategy', checkSignIn,function (req, res) {
        res.sendFile("strategy.html", {"root": __dirname});
    });

    app.get('/gainerloser', checkSignIn,function (req, res) {
        res.sendFile("gainerloser.html", {"root": __dirname});
    });

    var  lastObject = {open:'',close:'',low:'',high:'',volume:'',LASTTRADETIME:'',rsi:'',sma:'',bb:{upper:'',lower:'',isCrossed:'',middel:'',pb:''}};
    var stockData = [];


    app.get('/deleteApplyStrategy/:id',checkSignIn, function (req, res) {
        var id = req.params.id;  
        var query = "DELETE FROM applyStrategy WHERE id = ?";
        var param = [id];
        
        getAll(query,param).then(strategy => {
                //console.log("result > " + JSON.stringify(strategy));
                if(strategy == undefined)
                {
                    res.send("error")
                }
                else{
                    getAllLiveStrategy();
                    res.send("success")
                }
        });    
    });

    app.post('/applyStrategy',checkSignIn, function (req, res) {
        var strategyObj = JSON.parse(req.body.data);
        
        var uid = strategyObj.uid;
        var sid = strategyObj.sid;
        var symbol = strategyObj.symbol;
        var exchange = strategyObj.exchange;
        var interval = strategyObj.interval;
        var isIntraday = strategyObj.isIntraday;
        var odrerType = strategyObj.odrerType;
        var quantity = strategyObj.quantity;
        var transaction_type = strategyObj.transaction_type;

        var slSid = strategyObj.slSid;
        var profitSid = strategyObj.profitSid;
        var slPercent = strategyObj.slPercent;
        var slPoints = strategyObj.slPoints;
        var profitPercent = strategyObj.profitPercent;
        var profitPoints = strategyObj.profitPoints;
        var isLive = strategyObj.isLive;
        
        var query = "INSERT INTO applyStrategy (uid,sid,symbol,exchange,interval,isIntraday,odrerType,quantity,transaction_type,slSid,profitSid,slPercent,slPoints,profitPercent,profitPoints,isLive)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var param = [uid,sid,symbol,exchange,interval,isIntraday,odrerType,quantity,transaction_type,slSid,profitSid,slPercent,slPoints,profitPercent,profitPoints,isLive];
        
        insertDB(query,param).then(responses => {
            if(responses == 'success')
            {
                getAllLiveStrategy();
                //getLiveSymbol();
                res.send('success');
            }
            else{
                res.send("error");
            }
        });
    });

    app.post('/createStrategy',checkSignIn, function (req, res) {
        var strategyObj = JSON.parse(req.body.data);
        //console.log("strategyObj > " + JSON.stringify(strategyObj));
        var uid = strategyObj.uid;
        var name = strategyObj.name;
        var description = strategyObj.description;
        var category = strategyObj.category;
        var isPrivate = strategyObj.isPrivate;

        var query = "INSERT INTO Strategy (uid,name,description,category,isPrivate)VALUES(?,?,?,?,?)";
        var param = [uid,name,description,category,isPrivate];
        
        insertDB(query,param).then(responses => {
            if(responses == 'success')
            {
                var query1 = 'select last_insert_rowid();';//"select sid from Strategy where uid=?";
                var param1 =[];

                getFirst(query1,param1).then(obj1 => {
                    if(obj1 == undefined){
                        res.send("error")
                    }
                    else{
                        var sid = obj1['last_insert_rowid()'];
                        strategyObj.indicators.map(async (obj) => {
                            var indicator1= obj.indicator1;
                            var indicator2= obj.indicator2;
                            var indicator_config1= obj.indicator_config1;
                            var indicator_config2= obj.indicator_config2;
                            var value = obj.value;
                            var op = obj.op;
                            var q = "INSERT INTO Indicators (sid,indicator1,indicator2,value,op,indicator_config1,indicator_config2)VALUES(?,?,?,?,?,?,?)";
                            var p = [sid,indicator1,indicator2,value,op,indicator_config1,indicator_config2];
                            
                            insertDB(q,p).then(responses => {
                                //console.log("Indicators result > " + JSON.stringify(responses));
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
    });

    app.post('/updateStrategy',checkSignIn, function (req, res) {
        var strategyObj = JSON.parse(req.body.data);
        //console.log("strategyObj > " + JSON.stringify(strategyObj));
        var sid = strategyObj.sid;
        var name = strategyObj.name;
        var description = strategyObj.description;
        var category = strategyObj.category;
        var isPrivate = strategyObj.isPrivate;
       
        var query = "UPDATE Strategy SET name = ?,description = ?,category = ?,isPrivate = ? WHERE sid = ?";
        var param = [name,description,category,isPrivate,sid];
        
        updateDB(query,param).then(response => {
            if(response == 'success')
            {
                var query = "DELETE FROM Indicators WHERE sid = ?";
                var p = [sid];
                getAll(query,p).then(res => {
                    //if(res == 'success')
                    //{
                        strategyObj.indicators.map(async (obj) => {
                            var indicator1= obj.indicator1;
                            var indicator2= obj.indicator2;
                            var indicator_config1= obj.indicator_config1;
                            var indicator_config2= obj.indicator_config2;
                            
                            var value = obj.value;
                            var op = obj.op;
                            //var q = "INSERT INTO Indicators (sid,indicator1,indicator2,value,op)VALUES(?,?,?,?,?)";
                            //var p = [sid,indicator1,indicator2,value,op];
                            var q = "INSERT INTO Indicators (sid,indicator1,indicator2,value,op,indicator_config1,indicator_config2)VALUES(?,?,?,?,?,?,?)";
                            var p = [sid,indicator1,indicator2,value,op,indicator_config1,indicator_config2];
                            
                            insertDB(q,p).then(responses => {
                                //console.log("Indicators result > " + JSON.stringify(responses));
                            }); 
                        });
                    //}
                });
               
                res.send('success');        
            }
            else{
                res.send("error");
            }
        });
    });

    
    app.get('/deleteStrategy/:sid',checkSignIn, function (req, res) {
        var sid = req.params.sid;  
        var query = "DELETE FROM Strategy WHERE sid =?";
        var param = [sid];
        getAll(query,param).then(strategy => {
                //console.log("result > " + JSON.stringify(strategy));
                if(strategy == undefined)
                {
                    res.send("error")
                }
                else{
                    //console.log("result > " + JSON.stringify(strategy));
                    res.send(strategy);
                }
        });    
    });
   
    app.get('/getAppliedList/:uid',checkSignIn, function (req, res) {
        var uid = req.params.uid;  
        var query = "SELECT applyStrategy.id,applyStrategy.uid,applyStrategy.sid,applyStrategy.symbol,applyStrategy.exchange,applyStrategy.interval,applyStrategy.isIntraday,applyStrategy.odrerType,applyStrategy.quantity,applyStrategy.transaction_type,Strategy.name,Strategy.description,Strategy.category,Strategy.isPrivate FROM applyStrategy LEFT JOIN Strategy ON Strategy.sid = applyStrategy.sid WHERE applyStrategy.uid=?;";

        //var query = "SELECT * FROM applyStrategy where uid=?";
        var param = [uid];
        getAll(query,param).then(strategy => {
                //console.log("result > " + JSON.stringify(strategy));
                if(strategy == undefined)
                {
                    res.send("error")
                }
                else{
                    //console.log("result > " + JSON.stringify(strategy));
                    res.send(strategy);
                }
        });    
    });

    app.get('/strategyList/:uid',checkSignIn, function (req, res) {
        var uid = req.params.uid;  
        var query = "SELECT sid,name,uid,description,category,isPrivate FROM Strategy where uid=?";
        var param = [uid];
        getAll(query,param).then(strategy => {
                //console.log("result > " + JSON.stringify(strategy));
                if(strategy == undefined)
                {
                    res.send("error")
                }
                else{
                    //console.log("result > " + JSON.stringify(strategy));
                    res.send(strategy);
                }
        });    
    });

    app.get('/indicatorList/:sid',checkSignIn, function (req, res) {
        var sid = req.params.sid;  
       // console.log("uid > " + uid);
       
        var query = "SELECT indicator_id,sid,indicator1,indicator2,value,indicator_config1,indicator_config2,op FROM Indicators where sid=?";
        var param = [sid];
        getAll(query,param).then(indicators => {
                //console.log("result > " + JSON.stringify(indicators));
                if(indicators == undefined)
                {
                    res.send("error")
                }
                else{
                    //console.log("indicators result > " + JSON.stringify(indicators));
                    res.send(indicators);
                }
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


    });
    
    app.get('/getStockIndicators/:symbol/:interval', checkSignIn,function (req, res) { 
        var symbol = req.params.symbol;  
        var interval = req.params.interval;  
        
        var data = getStockDataFromDb(symbol,interval).then(stockData =>{

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
                    if(stockData && stockData.data && stockData.data != null){
                        data = JSON.parse(stockData.data); 

                        data.reverse();
                        data.map(row => {
                            row.rsi = rsi.nextValue(Number(row.CLOSE));
                            row.sma = sma.nextValue(Number(row.CLOSE));
                            row.bb = bb.nextValue(Number(row.CLOSE));                
                            
                            return row;
                        });
                        data.reverse();          
                        res.setHeader('Content-Type', 'application/json');
                    }
                }
                catch(e){
                    console.log(e);
                }
                res.send(JSON.stringify(data));
                exchange = list = interval =  null;
                res.end(); 
             });
    });
    
    app.get('/getDefaultIndicators/:interval/:exchange', checkSignIn,function (req, res) { 
        var interval = req.params.interval;  
        var exchange = req.params.exchange;  

        var list = [];
      /*   if(exchange == "nifty")
            list =  nifty;
        else if(exchange == "fno")
            list = fno;
        else */
            list = watchList; 


        Promise.all(list.map(async (x) =>  {
            var symbol = x.symbol ? x.symbol:x; 
            var ohlc = getStockDataFromDb(symbol,interval);    
            return ohlc;         
            })).then(stockData => {
               
                //stockData = stockData.reverse();    
                var arr = stockData.map(async (dataObj) =>  {
                    try{
                        var data = JSON.parse(dataObj.data); 

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

                        //console.log("\n before " + JSON.stringify(data));
                        data.reverse();
                        //console.log("\n\n\n before " + JSON.stringify(data));
                        await data.map(async(row) => {
                            var india = moment.tz(new Date(Number(row.LASTTRADETIME)), "Asia/Kolkata");
                            india.format(); 
                            row.LASTTRADETIME = india.date() +"/"+(india.month()+1) +"/"+india.year()+" "+india.hour()+":"+india.minute();//new Date(row.LASTTRADETIME);
                            
                            
                            row.rsi = rsi.nextValue(Number(row.CLOSE));
                            row.sma = sma.nextValue(Number(row.CLOSE));
                            row.bb = bb.nextValue(Number(row.CLOSE));
                            
                           // console.log("symbol "+ dataObj.symbol +" > "+row.rsi); 

                            if(row.bb && Number(row.CLOSE) > Number(row.OPEN) && Number(row.CLOSE) >= Number(row.bb.upper) && Number(row.OPEN) < Number(row.bb.upper))
                            {
                                row.bb.isCrossed = 'Crossed Above';
                            }
                            else if(row.bb && Number(row.CLOSE) < Number(row.OPEN) && Number(row.CLOSE) <= Number(row.bb.LOWer)  && Number(row.OPEN) > Number(row.bb.LOWer))
                            {
                                row.bb.isCrossed = 'Crossed Below';
                            }
                            else if(row.bb && Number(row.CLOSE) < Number(row.OPEN) && Number(row.CLOSE) <= Number(row.bb.upper)  && Number(row.OPEN) > Number(row.bb.upper))
                            {
                                row.bb.isCrossed = 'Reversal Upper Band';
                            }
                            else if(row.bb && Number(row.CLOSE) > Number(row.OPEN) && Number(row.CLOSE) >= Number(row.bb.LOWer)  && Number(row.OPEN) < Number(row.bb.LOWer))
                            {
                                row.bb.isCrossed = 'Reversal Lower Band';
                            }
                            
                            lastObject = row;
                            return row;
                        });
                        data.reverse();

                        var resonseData = {
                            "symbol":dataObj.symbol,
                            "close":data[0].CLOSE,
                            "volume":data[0].TRADEDQTY,
                            "rsi":data[0].rsi,
                            "LASTTRADETIME":data[0].LASTTRADETIME,
                            "sma":data[0].sma, 
                            "bb":data[0].bb
                        }; 
                        //console.log("row "+ JSON.stringify(resonseData)); 
                        return resonseData;
                      
                    }
                    catch(e){
                        //console.log("stockData.map Error " + e);
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

    app.get('/getListOfAllSymbol/:exchange/:instrumentType', checkSignIn,function (req, res) {   
        res.setHeader('Content-Type', 'application/json');
        var exchange = req.params.exchange;  
        var instrumentType = req.params.instrumentType;  
        var data = {};
        data.exchange = exchange;//"NFO";
        data.instrumentType = instrumentType;//"NFO";
        
        getAllSymbol(data).then(list=>{
            res.send(list);
            res.end();
        });
    });

    
    app.get('/getInstrumentsOnSearch/:exchange/:instrumentType/:search', checkSignIn,function (req, res) {   
        res.setHeader('Content-Type', 'application/json');
        var exchange = req.params.exchange;  
        var search = req.params.search;  
        var instrumentType = req.params.instrumentType;  
        var data = {};
        data.exchange = exchange;
        data.search = search;
        data.instrumentType = instrumentType;
        
        
        GetInstrumentsOnSearch(data).then(list=>{
            res.send(list);
            res.end();
        });
    });

    
    app.get('/getStrikePrices/:exchange/:instrumentType/:product/:optionType/:expiry', checkSignIn,function (req, res) {   
        res.setHeader('Content-Type', 'application/json');
        var exchange = req.params.exchange;  
        var instrumentType = req.params.instrumentType;  
        var expiry = req.params.expiry;  
        var product = req.params.product;  
        var optionType = req.params.optionType;  
        //ar exchange = req.params.exchange;  


        var data = {};
        data.exchange = exchange;
        data.optionType = optionType;
        data.product = product;
        data.expiry = expiry;
        data.instrumentType = instrumentType;
        
        GetStrikePrices(data).then(list=>{
            console.log("GetStrikePrices  \n\n  "+list);
            res.send(list);
            res.end();
        });
    });

    app.get('/getOptionType/:exchange', checkSignIn,function (req, res) {   
        res.setHeader('Content-Type', 'application/json');
        var exchange = req.params.exchange;  
        var data = {};
        data.exchange = exchange;
        GetOptionType(data).then(list=>{
            //console.log("GetOptionType  \n\n  "+list);
            res.send(list);
            res.end();
        });
    });

    app.get('/getInstrumentTypes/:exchange', checkSignIn,function (req, res) {   
        res.setHeader('Content-Type', 'application/json');
        var exchange = req.params.exchange;  
        var data = {};
        data.exchange = exchange;//"NFO";
        GetInstrumentTypes(data).then(list=>{
            //console.log("GetInstrumentTypes  \n\n  "+list);
            res.send(list);
            res.end();
        });
    });

    app.get('/getExpiryDates/:exchange/:instrumentType/:product', checkSignIn,function (req, res) {   
        res.setHeader('Content-Type', 'application/json');
        var exchange = req.params.exchange;  
        var instrumentType = req.params.instrumentType;  
        var product = req.params.product;  
        var data = {};
        data.exchange = exchange;//"NFO";
        data.instrumentType= instrumentType;//"OPTSTK";
        data.product = product;//"ACC";

        GetExpiryDates(data).then(list=>{
            console.log("getExpiryDates  \n\n  "+JSON.stringify(list));
            res.send(list.EXPIRYDATES);
            res.end();
        });
    });

    app.get('/getIndices', checkSignIn,function (req, res) {   
        res.setHeader('Content-Type', 'application/json');
        
        GetExchanges().then(list=>{
            res.send(list);
            res.end();
        });
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

    app.get('/authenticate', function (req, res) {  
        res.sendFile("index.html", {"root": __dirname}); 
        var your_api_key ="ukXaJKtebf3pfLnbrplan3mDi1yOtV4I2cyia4aO";
        var api_secret="70rkwasp80";
        var userObj = userObjList[index];
        var up = new UpstoxBroker(your_api_key,api_secret,false);
        currentUserObj= userObj.traderObject = up;
        userObjList[index] = userObj;
        //autoLogin();
        
    });

    app.post('/scan', function (req, res) {

    });

    app.get('/admin', checkSignIn,function (req, res) {
        var india = moment.tz(store.get('tokenValidity'),"Asia/Kolkata");
        var d =new Date();
        var now1 = moment.tz(d, 'YYYY-DD-MM HH:mm',"Asia/Kolkata");
        now1.format(); 
        console.log("tokenValidity "  +now1 +":"+india+":"+ india.isBefore(now1));
        
       /*  var loginUrl = upstox.getLoginUri(redirect_uri);
        console.log("*loginUri " + loginUrl);
        res.status(200).header('Content-type', 'text/html');
        code = req.params.code;
        res.status(302).setHeader('Location', loginUrl);
        res.end(); */
        
    });

   
    // Change the 404 message modifing the middlewar
    app.use(function(req, res, next) {
        res.status(404).send("<h1>404 ! This site can’t be reached</h1>");
    });

    // start the server in the port 3000 !
    app.listen(PORT, function () {
    console.log('App listening on port '+PORT);
   // console.log(`Heapdump enabled. Run "kill -USR2 ${process.pid}" or send a request to "/heapdump" to generate a heapdump.`);
    });
/* }

// Listen for dying workers
cluster.on('exit', function (worker) {

    // Replace the dead worker,
    // we're not sentimental
    console.log('Worker %d died :(', worker.id);
    cluster.fork();

}); */
