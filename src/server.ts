var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var url = require('url');
const https = require('https');
const dataForge = require('data-forge');
require('data-forge-plot'); 
require('data-forge-fs');
var Upstox = require("upstox");
var api:string = "cIs71szuLZ7WFKInU8O0o7GTHm5QIJke8ahnzLVw";
var upstox = new Upstox(api);
const PORT = process.env.PORT || 8080;
var redirect_uri = "http://localhost:"+PORT;
var nifty = "https://www.nseindia.com/content/indices/ind_nifty50list.csv";
var fno = "https://www.nseindia.com/content/fo/fo_mktlots.csv";
var jsdom = require('jsdom').jsdom;

if(process.env.NODE_ENV=="production")
{
    api = "cIs71szuLZ7WFKInU8O0o7GTHm5QIJke8ahnzLVw";
    redirect_uri = "https://robo-trader.herokuapp.com/";
}

var app = express();
app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

var date = new Date();
var today = date.getDate() +"-"+date.getMonth() +"-"+date.getFullYear();
var time = date +":"+date.getHours() +":"+date.getMinutes();

      
var fnoArr=  dataForge.readFileSync("data/list/fo_mktlots.csv")
.parseCSV()
.toArray();

var fnoList = [];
fnoArr.forEach(function(item) {   
    if(item.Symbol)
        fnoList.push(item.Symbol)
    else
        fnoList.push(item.SYMBOL)
});
  
var niftyList =  dataForge.readFileSync("data/list/ind_nifty50list.csv")
.parseCSV()
.toArray();

niftyList = niftyList.map(x => x.Symbol);


app.get('/', function (req:any, res:any) {
    var q = url.parse(req.url, true).query;
    code = q.code;
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
});

app.get('/welcome', function (req:any, res:any) {
    res.send('<b>Hello</b> welcome to my http server made with express');
});

app.get('/login', function (req:any, res:any) {
     res.sendFile("login.html", {"root": __dirname});
});

app.post('/login', function (req:any, res:any) {
    var username = req.body.username;
    var password = req.body.password;
   
    if(username)
        res.send('<b>username </b>  : ' + username +" > "+ password);
    else
        res.sendFile("login.html", {"root": __dirname});
});

app.get('/signup', function (req:any, res:any) {
    res.sendFile("signup.html", {"root": __dirname});
});

app.post('/signup', function (req:any, res:any) {
    var email = req.body.email;
    var psw = req.body.psw;
    var pswRepeat = req.body.pswRepeat;
   
    if(email)
        res.send('<b>username </b>  : ' + email +" > "+ psw);
    else
        res.sendFile("signup.html", {"root": __dirname});
});

app.get('/contactus', function (req:any, res:any) {
    res.sendFile("contactus.html", {"root": __dirname});
});

app.get('/index', function (req:any, res:any) {
    res.sendFile("index.html", {"root": __dirname});
});

app.get('/scan', function (req:any, res:any) {
    res.sendFile("scanner.html", {"root": __dirname});
});

app.get('/loadSymbol/:symbol/:interval', function (req:any, res:any) { 
    var symbol = req.params.symbol;  
    var interval = req.params.interval; 
    
    var now = new Date();
    now.setDate(now.getDate() - 20);
    var start_date = now.getDate()+"-"+now.getMonth+"-"+now.getFullYear();

    initiateIndicator();

    loadSymbol(symbol,'nse_eq',interval,start_date).then(function (response:any) {
        res.setHeader('Content-Type', 'application/json');
        var stockData =response.data;
        
        var lastObject = {open:'',close:'',low:'',high:'',volume:'',timestamp:'',rsi:'',sma:'',bb:{upper:'',lower:'',isCrossed:'',middel:'',pb:''}};
        stockData.map(row => {
            row.timestamp = new Date(row.timestamp);
            row.rsi = rsi.nextValue(Number(row.close));
            row.sma = sma.nextValue(Number(row.close));
            row.bb = bb.nextValue(Number(row.close)); 
            
            if(Number(row.close) >= row.bb.upper && Number(lastObject.close) < Number(lastObject.bb.upper))
            {
                row.bb.isCrossed = 'Crossed Above';
            }
            else if(Number(row.close) <= row.bb.lower && Number(lastObject.close) > Number(lastObject.bb.lower))
            {
                row.bb.isCrossed = 'Crossed Below';
            }
            lastObject = row;
            return row;
        });
        stockData.reverse();
        res.send(JSON.stringify(stockData));
        res.end();
    })
    .catch(function(error:any){
       log("loadSymbol/:symbol error > " +  JSON.stringify(error));
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
}

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
    loadAllSymbolData(list,interval,'10-11-2018').then(function (response:any) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
        res.end();
    })
    .catch(function(error:any){
       log("loadAllSymbolData/ error > " +  JSON.stringify(error));
    });
});
 
app.get('/getListOfAllSymbol', function (req:any, res:any) {   
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(nseSymbolList));
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
    log("**************** loginUri ***********\n" + loginUrl);
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

