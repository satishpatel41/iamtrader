var websocketClient = require('websocket').client;
var client = new websocketClient();
var endpoint = "ws://nimblestream.lisuns.com:4526/";
var accesskey = "330801d2-f410-4236-ac10-742719b9929b";
//var accesskey =  '26df25b8-fce0-4a08-b298-f21dbbb88e23';
var output;
var connection;

client.on('connectFailed', function(error){
	console.log('Connection Error: ' + error.toString());
});

client.on('connect', function(conn){
	var AuthConnect = false;
	var callDone = false;
	connection = conn;
	console.log('Global feed Client Connected!');
	//Authenticate();
	//autoLogin();
	connection.on('error',function(error){
		console.log('Connection Error: ' + error.toString());
	});
	connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
	connection.on('message', function(message) {
		// setTimeout(doClose, 120000);
		if (message.type === 'utf8') {
			AuthConnect = true;
            //console.log("Received: '" + message.utf8Data + "'");
			if(callDone == false)
			{
				setTimeout(functionCall, 2000);
				callDone = true;
			}
        }
    });
});

client.connect(endpoint);























function doClose()
	{
      connection.close();
	}
  
	function callAPI(request){
		console.log("request: *****" + request);
		if (connection.connected) {
            connection.sendUTF(request);
        }
	}
	function Authenticate() {
		
        if (connection.connected) {
            strMessage = '{"MessageType":"Authenticate","Password":"' + accesskey + '"}'
			callAPI(strMessage);
        }
    }
	
	function functionCall(){
		//SubscribeSnapshot();
		// SubscribeRealtime();
		//GetServerInfo();
		//GetLimitation();
		//GetFundamentalData();
		//GetFundamentalSupportedIndicators();
		//GetFundamentalIndicators();
		//GetFundamentalInstruments();
		//GetSnapshot();
		//GetLastQuote();
		//GetLastQuoteArray();
		//GetMarketMessages();
		// GetExchangeMessages();
		// GetStrikePrices();
		//GetOptionTypes();
		 //GetExpiryDates();
		 //GetProducts();
		// GetInstrumentTypes();
		 //GetInstruments();
		// GetExchanges();
	  // GetHistory1();
	//	 GetHistory();
		//GetInstrumentsOnSearch();
	}
	
	functionCall();
	
    function SubscribeSnapshot()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NSE";
			var InstIdentifier = "TATAPOWER";
			var Periodicity = "MINUTE";
			var Unsubscribe = "false";
			request = '{"MessageType":"SubscribeSnapshot","Exchange":"' + ExchangeName + '","InstrumentIdentifier":"' + InstIdentifier + '","Periodicity":"' + Periodicity +'","Unsubscribe":"' + Unsubscribe + '"}';
			callAPI(request);
		}
	}
	
	function SubscribeRealtime()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NSE";
			var InstIdentifier = "TATAPOWER";
			request = '{"MessageType":"SubscribeRealtime","Exchange":"' + ExchangeName + '","InstrumentIdentifier":"' + InstIdentifier + '"}';
			callAPI(request);
		}
	}
	
	function GetServerInfo()
	{
		if (connection.connected) 
		{
			request = '{"MessageType":"GetServerInfo"}';
			callAPI(request);
		}
	}
	
	function GetLimitation()
	{
		if (connection.connected) 
		{
			request = '{"MessageType":"GetLimitation"}';
			callAPI(request);
		}
	}

	function GetFundamentalData()
	{
		if (connection.connected) 
		{
			request = '{"MessageType":"GetFundamentalData","Instrument":"GPPL","IndicatorCode":"GPPL","FrequrencyCode":"A"}';
			callAPI(request);
		}
	}
	
	function GetFundamentalSupportedIndicators()
	{
		if (connection.connected) 
		{
			request = '{"MessageType":"GetFundamentalSupportedIndicators","Instrument":"GPPL"}';
			callAPI(request);
		}
	}
	
	function GetFundamentalIndicators()
	{
		if (connection.connected) 
		{
			request = '{"MessageType":"GetFundamentalIndicators"}';
			callAPI(request);
		}
	}
	
	function GetFundamentalInstruments()
	{
		if (connection.connected) 
		{
			request = '{"MessageType":"GetFundamentalInstruments"}';
			callAPI(request);
		}
	}
	
	function GetSnapshot()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NSE";
			var InstIdentifier = '[{"Value":"TATAPOWER"}]';
			var Periodicity = "MINUTE";
			var Period = 1;
			request = '{"MessageType":"GetSnapshot","Exchange":"' + ExchangeName + '","Periodicity":"' + Periodicity + '","Period":' + 1 + ',"InstrumentIdentifiers":' + InstIdentifier + '}';
			callAPI(request);
		}
	}
	
	function GetLastQuoteArray()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NSE";
			var InstIdentifier = '[{"Value":"TATAPOWER"}, {"Value":"RELIANCE"}]';
			request = '{"MessageType":"GetLastQuoteArray","Exchange":"' + ExchangeName + '","InstrumentIdentifiers":'+ InstIdentifier +'}';
			callAPI(request);
		}
	}
	
	function GetLastQuote()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NSE";
			var InstIdentifier = "FUTSTK_RPOWER_28SEP2017_XX_0";
			request = '{"MessageType":"GetLastQuote","Exchange":"' + ExchangeName + '","InstrumentIdentifier":"' + InstIdentifier + '"}';
			callAPI(request);
		}
	}
	
	function GetMarketMessages()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NSE";
			request = '{"MessageType":"GetMarketMessages","Exchange":"' + ExchangeName +'"}';
			callAPI(request);
		}
	}
	
	function GetExchangeMessages()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NSE";
			request = '{"MessageType":"GetExchangeMessages","Exchange:"' + ExchangeName + '"}';
			callAPI(request);
		}
	}
	

	///******************************************************************** */
	function GetStrikePrices()
	{
		if (connection.connected) 
		{
            var ExchangeName = "NFO";
            var request =
            {
            MessageType: "GetStrikePrices",
            Exchange: ExchangeName,
            Product:"BANKNIFTY"
            };
            var message = JSON.stringify(request);
			// request = '{"MessageType":"GetStrikePrices","Exchange":"' + ExchangeName + '"}';
			callAPI(message);
		}
	}
	
	function GetOptionTypes()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NFO";
			request = '{"MessageType":"GetOptionTypes","Exchange":"' + ExchangeName + '"}';
			callAPI(request);
		}
	}
	
	function GetExpiryDates()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NFO";
            var request =
            {
            MessageType: "GetExpiryDates",
			Exchange: ExchangeName,
			InstrumentType:"OPTIDX",
            Product:"BANKNIFTY"
            };
            var message = JSON.stringify(request);
			// request = '{"MessageType":"GetExpiryDates","Exchange":"' + ExchangeName + '"}';
			callAPI(message);
		}
	}
	
	async function GetProducts()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NFO";
			request = '{"MessageType":"GetProducts","Exchange":"' + ExchangeName + '"}';
			callAPI(request);
		}
	}
	
	function GetInstrumentTypes()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NFO";
			// var ExchangeName = "NSE";
			// var ExchangeName = "NFO";
			request = '{"MessageType":"GetInstrumentTypes","Exchange":"' + ExchangeName + '"}';
			callAPI(request);
		}
	}
	
	function GetExchanges() 
	{
        if (connection.connected) 
		{
            strMessage = '{"MessageType":"GetExchanges"}'
            callAPI(strMessage);
        }
    }
	
	function GetInstruments()
	{
		if (connection.connected) 
		{
            var ExchangeName = "NFO";
            var InstrumentType = "OPTIDX";
            var request =
            {
                MessageType: "GetInstruments",
                Exchange: ExchangeName,
                Product:"BANKNIFTY",
                OptionsType:"CE",
                InstrumentType:InstrumentType,
                Expiry:"04JUL2019",
                StrikePrice:"31000"
            };
            var message = JSON.stringify(request);
			// request = '{"MessageType":"GetInstruments","Exchange":"' + ExchangeName + '"}';
			callAPI(message);
		}
	}
	
	function GetHistory()
	{
		if (connection.connected) 
		{
            var request =
            {
                MessageType: "GetHistory",
                Exchange: "NFO",
                InstrumentIdentifier: "OPTIDX_BANKNIFTY_25OCT2018_CE_25300",
                Periodicity: "MINUTE",
                Period: 5,
                From: 1540352700,
                To: 1540451700,
				Max: 0,
				is_chakravyuh:1
            };
            var message = JSON.stringify(request);
			// request = '{"MessageType":"GetHistory","Exchange":"' + ExchangeName + '","InstrumentIdentifier":"' + InstIdentifier + '","Periodicity":"' + Periodicity + '","Period":' + Period + ',"Max":' + Max + '}';
			callAPI(message);
		}else{
            console.log("elseelseelseelseelseelseelseelseelseelseelseelse")
        }
	}




	function GetHistory1()
	{

		if (connection.connected) 
		{
            var request =
            {
                MessageType: "GetHistory",
                Exchange: data.exchange,
                InstrumentIdentifier: data.instrumentIdentifier,
                Periodicity: "MINUTE",
				Period: 5,
				max: 180
		/* ,
                From: 1540352700,
                To: 1540451700,
                Max: 0 */
            };
            var message = JSON.stringify(request);
			// request = '{"MessageType":"GetHistory","Exchange":"' + ExchangeName + '","InstrumentIdentifier":"' + InstIdentifier + '","Periodicity":"' + Periodicity + '","Period":' + Period + ',"Max":' + Max + '}';
			callAPI(message);
		}else{
            console.log("elseelseelseelseelseelseelseelseelseelseelseelse")
        }
	}
	
	function GetInstrumentsOnSearch()
	{
		if (connection.connected) 
		{
			var ExchangeName = "NSE";
			var Search = "TATA"
			request = '{"MessageType":"GetInstrumentsOnSearch","Exchange":"' + ExchangeName + '","Search":"' + Search + '"}';
			callAPI(request);
		}
	}