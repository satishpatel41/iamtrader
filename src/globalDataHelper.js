//let globalApiCall = require('globalApiCall');
let baseUrl = "http://nimblerest.lisuns.com:4531/";
// let api_key = '26df25b8-fce0-4a08-b298-f21dbbb88e23'; //default
//let api_key = '26df25b8-fce0-4a08-b298-f21dbbb88e23'; // 300000 
// let api_key = 'b911b3b7-511b-46fd-927f-a322d693f3b1'; // unlimited
// let api_key = 'b911b3b7-511b-46fd-927f-a322d693f3b1'; // block
//let api_key =  'ba556947-d006-4e19-b367-fa05d2359821';// //config.globaldata_api_key ||"dfd8b486-50fb-46ee-9d29-d834d0257a43"; // 
let api_key_arr =['2ef480f5-2d4e-4d81-96e2-513b50acc9d9','26df25b8-fce0-4a08-b298-f21dbbb88e23','b911b3b7-511b-46fd-927f-a322d693f3b1'] ;


var api_key = "fc697f44-2483-4301-9fda-49b2e2815e02"

async function getAllSymbol(data) {
    var url = baseUrl + "GetProducts/";
    var urlParameters ={
        accessKey: api_key,
        xml: false,
        instrumentType: data.instrumentType,
        exchange: data.exchange
    }
    let products = await GET(url, urlParameters);
    //console.log("products" + JSON.stringify(products));
    return products.PRODUCTS;
}


async function GetHistory3Minute(data) {
    var url = baseUrl + "GetHistory/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false,
        exchange: data.exchange,
        //instrumentType:'FUTSTK',
        instrumentIdentifier: data.instrumentIdentifier,
        periodicity: 'MINUTE',
        period:3,
        max: 180
    };
    let three_min_candle = await GET(url, urlParameters);
    return three_min_candle;
}

async function GetHistory5Minute(data) {

   //GetHistory1(data);


    var url = baseUrl + "GetHistory/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false,
        exchange: data.exchange,
        instrumentIdentifier: data.instrumentIdentifier,
        periodicity: 'MINUTE',
        period:5,
        max: 180
    };
    let five_min_candle = await GET(url, urlParameters);
    return five_min_candle;
}

async function GetHistory15Minute(data) {
    var url = baseUrl + "GetHistory/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false,
        exchange: data.exchange,
        instrumentIdentifier: data.instrumentIdentifier,
        period:15,
        periodicity: 'MINUTE',
        max: 180
    };
    let fifteen_min_candle = await GET(url, urlParameters);
    return fifteen_min_candle;
}

async function GetHistory30Minute(data) {
    var url = baseUrl + "GetHistory/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false,
        exchange: data.exchange,
        instrumentIdentifier: data.instrumentIdentifier,
        period:30,
        periodicity: 'MINUTE',
        max: 180
    };
    let fifteen_min_candle = await GET(url, urlParameters);
    return fifteen_min_candle;
}

async function GetHistory60Minute(data) {
    var url = baseUrl + "GetHistory/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false,
        exchange: data.exchange,
        instrumentIdentifier: data.instrumentIdentifier,
        period:1,
        periodicity: 'HOUR',
        max: 500
    };
    let fifteen_min_candle = await GET(url, urlParameters);
    return fifteen_min_candle;
}

async function GetHistory1Day(data) {
    var url = baseUrl + "GetHistory/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false,
        exchange: data.exchange,
        instrumentIdentifier: data.instrumentIdentifier,
        period:1,
        periodicity: 'DAY'
    };
    let fifteen_min_candle = await GET(url, urlParameters);
    return fifteen_min_candle;
}

async function GetFundamentalInstruments(){
    var url = baseUrl + "GetFundamentalInstruments/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false
    };
    let fundamentalInstruments = await GET(url, urlParameters);
    return fundamentalInstruments;
}

async function GetInstrumentTypes(data){
    var url = baseUrl + "GetInstrumentTypes/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false,
        exchange:data.exchange
    };
    let instrumentTypes = await GET(url, urlParameters);
    return instrumentTypes.INSTRUMENTTYPES;
}

async function GetExpiryDates(data){
    var url = baseUrl + "GetExpiryDates/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false,
        exchange:data.exchange,
        instrumentType:data.instrumentType,
        product:data.product
    };
    let expiryDates = await GET(url, urlParameters);
    return expiryDates;

}

async function GetInstruments(data){
    console.log(data)
    var url = baseUrl + "GetInstruments/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false,
        exchange:data.exchange,
        instrumentType:data.instrumentType,
        product:data.product,
        expiry:data.expiry,
        optionsType:data.optionsType    
    };
    let expiryDates = await GET(url, urlParameters);
    return expiryDates;

}

async function GetSnapshot (data){
    var url = baseUrl + "GetInstruments/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false,
        exchange:data.exchange,
        instrumentIdentifiers:data.instrumentIdentifiers
    };
    let snapShot = await GET(url, urlParameters);
    return snapShot;
}

async function GetLastQuote(data){
    var url = baseUrl + "GetLastQuote/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false,
        exchange:data.exchange,
        instrumentIdentifier:data.instrumentIdentifier
    };
    let lastQuote = await GET(url, urlParameters);
    return lastQuote;
}

async function GetExchanges() 
{
    var url = baseUrl + "GetExchanges/";
    var urlParameters =
    {
        accessKey: api_key,
        xml: false
    };
    let ex = await GET(url, urlParameters);
    return ex.EXCHANGES;
}

async function GetOptionType() 
{
    var url = baseUrl + "GetOptionTypes/";
    var urlParameters =
    {
        accessKey: api_key,
        exchange:data.exchange,
        xml: false
    };
    let ex = await GET(url, urlParameters);
    return ex.OPTIONTYPES;
}

async function GetStrikePrices(data) 
{
    var url = baseUrl + "GetStrikePrices/";
    var urlParameters =
    {
        accessKey: api_key,
        instrumentType:data.instrumentType,
        expiry:data.expiry,
        optionType:data.optionType,
        exchange:data.exchange,
        product:data.product,
        xml: false
    };
    let ex = await GET(url, urlParameters);
    return ex.STRIKEPRICES;
}


async function GetInstrumentsOnSearch(data) 
{
    var url = baseUrl + "GetInstrumentsOnSearch/";
    var urlParameters =
    {
        accessKey: api_key,
        exchange:data.exchange,
        instrumentType:data.instrumentType,
        search:data.search,
        xml: false
    };
    let ex = await GET(url, urlParameters);
    //console.log(JSON.stringify(ex.INSTRUMENTS));
    return ex.INSTRUMENTS;
}
