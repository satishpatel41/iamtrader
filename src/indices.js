
var nifty = require('../db/list/nifty.json').list.sort();
var fno = require('../db/list//fno.json').list.sort();

var data = new Object();
data.exchange = "NFO";
//var fno = getAllSymbol(data);
//require('../db/list//fno.json').list.sort();


var nse = require('../db/list/nse.json').list.sort();

var indices = [];//{symbol:"NIFTY_50",ex:"nse_index"},
              //{symbol:"NIFTY%20BANK",ex:"nse_index"},
              //{symbol:"NIFTY_100",ex:"nse_index"},
              //{symbol:"BANKNIFTY19JUNFUT",ex:"NSE_FO"},
              //{symbol:"NIFTY19JUNFUT",ex:"NSE_FO"},
              //{symbol:"SBIN19JUNFUT",ex:"NSE_FO"}
              
              //];

var bankNifty_indices = [];//{symbol:"BANKNIFTY19JUNFUT",ex:"NSE_FO"}];
var bankNiftySymbol = "BANKNIFTY19JUNFUT";
watchList =  nifty;
