let request = require('async-request');
const fetch = require("node-fetch");


let cnt=0;
//module.exports = {
    async function GET(url,params){
        //console.log("Global data request",url +" : "+ JSON.stringify(params));
        var selfInst = this;
        try {
            if (params){
                url = generateUrl(url, params);
            }
            // cnt++
            //console.log("Global data request",cnt);
           
            return getData (url);
        } catch (e) {
            //console.error(e)
            return e;
        }
    }

    function generateUrl(url, params) {
        var i = 0, key;
        for (key in params) {
            if (i == 0)
                url += "?";
            else
                url += "&";
            url += key + '=' + params[key];
            i++;
        }
        return url;
    }
//} 


const getData = async url => {
  try {
    //console.log(url);
    const response = await fetch(url);
    const json = await response.json();
    //console.log(json);
    return json;
  } catch (error) {
    //console.log(error);
  }
};
