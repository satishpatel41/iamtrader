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
            return retry(getData,1000,5, url,0);// return getData (url);
        } catch (e) {
            console.error(e)
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


const retry = (fn, ms=1000,maxRetries=5,url,retries) =>
     new Promise((resolve,reject) => { 
        //var retries=0;
        fn(url)
        .then(resolve)
        .catch(() => {
            setTimeout(() => {
                console.log('retrying..' + retries+" : "+ maxRetries+" : " + url);
                ++retries;
                if(retries==maxRetries) {
                    return reject('maximum retries exceeded');
                }
                retry(fn, ms,maxRetries,url,retries).then(resolve);
            }, ms);
        })
});


const getData = async url => {
    //console.log(url);
    var response = await fetch(url);
    if(response.size == 0){
        //reject('');
    }
    const json = await response.json();
    return json;  
};
