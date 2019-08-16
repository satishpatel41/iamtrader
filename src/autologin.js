const {Builder, By, Key, until} = require('selenium-webdriver');

var userObjList =[
    {
        your_api_key :"ukXaJKtebf3pfLnbrplan3mDi1yOtV4I2cyia4aO",
        your_redirect_uri : "https://robo-trader.herokuapp.com/callback/",//"http://localhost:3000/callback/",
        user :"169361",
        password : "Jiyana@123",
        password2f : "1983",
        api_secret:"70rkwasp80",
        isFullyAutomated:true
    }
]

var upstoxObjList = [];
var currentUserObj;
async function autoLogin(){
   var index= 0;
    userObjList.map(async(userObj)=>{
        
        if(!userObj.isFullyAutomated){
            return;
        }

        (async function init() {
            let driver = await new Builder().forBrowser('chrome').build();
            try {
                var up = new UpstoxBroker(userObj.your_api_key,userObj.api_secret,true);
                var currentUserObj= userObj;
                currentUserObj.traderObject = up;
                upstoxObjList.push(currentUserObj);

                await driver.get('https://api.upstox.com/index/dialog/authorize?apiKey='+userObj.your_api_key+'&redirect_uri='+userObj.your_redirect_uri+'&response_type=code');
                await driver.findElement(By.name('username')).sendKeys(userObj.user, Key.RETURN);
                await driver.findElement(By.name('password')).sendKeys(userObj.password, Key.RETURN);
                await driver.findElement(By.name('password2fa')).sendKeys(userObj.password2f, Key.RETURN);
                await driver.executeScript('document.getElementById("allow").click();');
            }  
            catch (e) {
                console.log("\n **autoLogin Error " + e);
            }
            finally {
                console.log("Login successfully at: " + new Date() +" : "+userObj.user )
                await driver.quit();
            }
        })();
    });
}

autoLogin();