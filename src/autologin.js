const {Builder, By, Key, until} = require('selenium-webdriver');
var upstoxObjList = [];
var userObjList =[];
/* var userObjList =[
    {
        your_api_key :"ukXaJKtebf3pfLnbrplan3mDi1yOtV4I2cyia4aO",
        your_redirect_uri : "http://localhost:3000/callback/",//"https://robo-trader.herokuapp.com/callback/",//
        user :"169361",
        broker_password : "Jiyana@1234",
        password2f : "1983",
        api_secret:"70rkwasp80",
        isFullyAutomated:true
    }
] */
//setTimeout(getAllUsers, 1000);

async function getAllUsers()
{
    var query = "select * from Users";
    var param = [];
    getAll(query,param).then(userList => {
    
        if(userList == undefined)
        {
            res.send("error")
        }
        else{
            //console.log("result > " + JSON.stringify(userList));
            userObjList = userList;
            autoLogin();
        }
    });  
}

 

var currentUserObj;
async function autoLogin(){
   var index= 0;
    userObjList.map(async(userObj)=>{
        
        if(!userObj.isFullyAutomated){
            return;
        }

        (async function init() {
            let driver;
            try {
                if(userObj.isFullyAutomated > 0 && userObj.user && userObj.your_api_key){
                    driver = await new Builder().forBrowser('chrome').build();
                    var up = new UpstoxBroker(userObj.your_api_key,userObj.api_secret,true);
                    var currentUserObj= userObj;
                    currentUserObj.traderObject = up;
                    upstoxObjList.push(currentUserObj);

                    await driver.get('https://api.upstox.com/index/dialog/authorize?apiKey='+userObj.your_api_key+'&redirect_uri='+userObj.your_redirect_uri+'&response_type=code');
                    await driver.findElement(By.name('username')).sendKeys(userObj.user, Key.RETURN);
                    await driver.findElement(By.name('password')).sendKeys(userObj.broker_password, Key.RETURN);
                    await driver.findElement(By.name('password2fa')).sendKeys(userObj.password2f, Key.RETURN);
                    await driver.executeScript('document.getElementById("allow").click();');
                }
            }  
            catch (e) {
                console.log("\n **autoLogin Error " + e);
            }
            finally {
                if(userObj.user && driver){
                    console.log("Login successfully at: " + new Date() +" : "+userObj.user )
                    await driver.quit();
                }
            }
        })();
    });
}