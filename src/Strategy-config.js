var strategy_smaCross1 = {
    name:"SMA Cross Over",
    description : "Crossed 20 sma with 50 SMA",
    strategy : [
    {
        indicators:
        [
            {indicator:'SMA',period : 20,values:"closes"},
            {indicator:'SMA',period : 50,values:"closes"}
        ],output:[],strategy:"output[0][0] >= output[1][0]"
    },
    {
        indicators:
        [
            {indicator:'SMA',period : 20,values:"closes"},
            {indicator:'SMA',period : 50,values:"closes"}
        ],output:[],strategy:"output[0][1] < output[1][1]"
    }
]}; 

var strategy_sma200 = {
    name:"SMA 200 Cross Over",
    description : "Close above 200 sma",
    strategy :[
        {
            indicators:
            [
                {indicator:'SMA',period : 200,values:"closes"}
            ],output:[],strategy:"closes[0] >= output[0][0]"
        }
]}; 

var strategy_rsi60_crossed = {
name:"RSI : 60 Cross Over",
description : "RSI : 60 Cross Over",
strategy : [
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][0] >= 60"
    }, 
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][1] <= 60"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) >= 0.5"
    }  
]}; 

var strategy_rsi40_crossed ={
    name:"RSI : 40 Cross Over",
    description : "RSI : 40 Cross Over",
    strategy : [
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][0] <= 40"
    }, 
    {
        indicators:
        [
            {indicator:'RSI',period : 14,values:"closes"}
        ],output:[],strategy:"output[0][1] >= 40"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) <= -0.5"
    }  
]}; 

var strategy_bbLower ={
    name:"Bollinger band : lower band Cross Over",
    description : "Bollinger band : lower band Cross Over",
    strategy : [
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"closes[0] <= output[0][0]['lower']"
    },
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"closes[1] >= output[0][1]['lower']"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"closes[0] < opens[0]"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) <= -0.5"
    }
]}; 

var strategy_bbUpper_band_crossed ={
    name:"Bollinger band : Upper band Cross Over",
    description : "Bollinger band : Upper band Cross Over",
    strategy : [
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"closes[0] >= output[0][0]['upper']"
    },
    {
        indicators:
        [
            {indicator:'BB',period : 14,values:"closes",stdDev : 2}
        ],output:[],strategy:"closes[1] <= output[0][1]['upper']"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"closes[0] > opens[0]"
    },
    {
        indicators:
        [
            {indicator:''}
        ],output:[],strategy:"((closes[0] - opens[0]) / (highs[0] - lows[0])) >= 0.5"
    } 
]}; 
    