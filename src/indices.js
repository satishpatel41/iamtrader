
  var nifty = require('../db/list/nifty.json').list.sort();
  var fno = require('../db/list//fno.json').list.sort();
  var nse = require('../db/list/nse.json').list.sort();

  var indices = [{symbol:"NIFTY_50",ex:"nse_index"},
                {symbol:"NIFTY%20BANK",ex:"NSE_INDEX"},
                {symbol:"NIFTY_100",ex:"NSE_INDEX"},
                {symbol:"BANKNIFTY19MAYFUT",ex:"NSE_FO"},
                {symbol:"BANKNIFTY1950929300PE",ex:"NSE_FO"},
                {symbol:"NIFTY19APRFUT",ex:"NSE_FO"}];

var bankNifty_indices = [{symbol:"BANKNIFTY19MAYFUT",ex:"NSE_FO"}];
var bankNiftySymbol = "BANKNIFTY19MAYFUT";
watchList =  nifty;
  