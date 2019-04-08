var strategy_smaCross1 = {
    name:"EMA Cross Over",
    description : "Crossed 13 ema with 50 SMA",
    isLive:false,
    isBuyOrSell:"b",
    strategy : [
    {
        indicators:
        [
            {indicator:'EMA',period : 13,values:"closes"},
            {indicator:'EMA',period : 50,values:"closes"}
        ],output:[],strategy:"output[0][0] >= output[1][0]"
    },
    {
        indicators:
        [
            {indicator:'SMA',period : 20,values:"closes"},
            {indicator:'SMA',period : 50,values:"closes"}
        ],output:[],strategy:"output[0][1] < output[1][1]"
    }
]
}; 

var strategy_sma200 = {
    name:"SMA 200 Cross Over",
    description : "Close above 200 sma",
    isBuyOrSell:"b",
    isLive:false,
    strategy :[
        {
            indicators:
            [
                {indicator:'SMA',period : 200,values:"closes"}
            ],output:[],strategy:"closes[i] >= output[0][i]"
        },
        {
            indicators:
            [
                {indicator:'SMA',period : 200,values:"opens"}
            ],output:[],strategy:"opens[i+1] <= output[0][i]"
        },
        {
            indicators:
            [
                {indicator:''}
            ],output:[],strategy:"closes[i] > opens[i]"
        }
]
}; 

var strategy_rsi60_crossed = {
name:"RSI : 60 Cross Over",
description : "RSI : 60 Cross Over",
isLive:false,
isBuyOrSell:"b",
strategy : [
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][i] >= 60"
    }, 
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][i+1] < 60"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) >= 0.5"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"closes[i] > opens[i]"
    }  
]
}; 

var strategy_rsi40_crossed ={
    name:"RSI : 40 Cross Over",
    description : "RSI : 40 Cross Over",
    isBuyOrSell:"s",
    isLive:false,
    strategy : [
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][i] <= 40"
    }, 
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][i+1] >= 40"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) <= -0.5"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"closes[i] < opens[i]"
    }  
]
}; 

var strategy_bbLower ={
    name:"Bollinger band : lower band Cross Over",
    description : "Bollinger band : lower band Cross Over",
    isBuyOrSell:"s",
    isLive:false,
    strategy : [
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"closes[i] <= output[0][i]['lower']"
    },
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"opens[i] >= output[0][i]['lower']"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"closes[i] < opens[i]"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[i] - opens[i]) / (highs[i] - lows[i])) <= -0.5"
    }
]
}; 

var strategy_bbUpper_band_crossed ={
    name:"Bollinger band : Upper band Cross Over",
    description : "Bollinger band : Upper band Cross Over",
    isBuyOrSell:"b",
    isLive:false,
    strategy : [
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"closes[i] >= output[0][i]['upper']"
    },
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"opens[i] <= output[0][i]['upper']"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"closes[i] > opens[i]"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[i] - opens[i]) / (highs[i] - lows[i])) >= 0.5"
    } 
]
}; 
    
var strategyList = [strategy_rsi60_crossed,strategy_bbUpper_band_crossed,strategy_bbLower];

var open_band_List = [strategy_bbUpper_band_crossed,strategy_bbLower];

/******Strong / week *****/

var strategy_rsi_above_60 = {
name:"RSI > 60 - Strong chart",
description : "RSI > 60 - Strong chart",
isLive:false,
isBuyOrSell:"b",
strategy : [
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][i] > 60"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) >= 0.5"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"closes[i] > opens[i]"
    }  
]
}; 

var strategy_rsi_below_40 = {
name:"RSI < 40 - Weak chart",
description : "RSI < 4 - weak charts",
isLive:false,
isBuyOrSell:"s",
strategy : [
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][i] < 40"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) <= -0.5"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"closes[i] < opens[i]"
    }  
]
}; 

var strategyStrongList = [strategy_rsi_above_60];


var strategyWeakList = [strategy_rsi_below_40];



/******OPEN = HIGH / OPEN = LOW *****/

var open_low = {
    name:"OPEN = LOW",
    description : "OPEN = LOW",
    isLive:false,
    isBuyOrSell:"b",
    strategy : [
        {
            indicators:
            [
                {indicator:''}
            ],output:[],strategy:"open[i] == low[i]"
        }  
    ]
}; 


var open_high = {
    name:"OPEN = HIGH",
    description : "OPEN = HIGH",
    isLive:false,
    isBuyOrSell:"s",
    strategy : [
        {
            indicators:
            [
                {indicator:''}
            ],output:[],strategy:"open[i] == high[i]"
        }  
    ]
}; 

var open_low_high_List = [open_high,open_low];