const Telegraf = require('telegraf')

let BOT_TOKEN = '771403265:AAG2pe87XLJ3Lc9HHsUWNO_C4c9uYHoOtKY';

/*  console.log("telegraf");
const bot = new Telegraf(BOT_TOKEN);//process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply('Welcome!' + ctx.bot.))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()
 */
  

const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Telegram = require('telegraf/telegram')

const keyboard = Markup.inlineKeyboard([
  Markup.urlButton('❤️', 'http://telegraf.js.org'),
  Markup.callbackButton('Delete', 'delete')
])

const bot = new Telegraf(BOT_TOKEN)
const telegram = new Telegram(BOT_TOKEN)


bot.start((ctx) => ctx.reply('Hello 1'))
bot.help((ctx) => ctx.reply('Help message 2'))
bot.on('message', (ctx) => {
    console.log(ctx.from.id)
    ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboard))
})
bot.action('delete', ({ deleteMessage }) => deleteMessage())
bot.launch()

//telegram.sendMessage('745141951', 'Message Content', {parse_mode: 'Markdown'});
let chatId = '745141951';//"@algotrade41" //
if(eventEmitter){
    eventEmitter.addListener('placeOrder', onSendNotification);
    function onSendNotification(data){
        //console.log('Received message => ' + data.strategy.symbol);
        telegram.sendMessage(chatId,  data.strategy.name +" "+ data.symbol +" at "+ data.price +" based on "+ data.interval +" candle", {parse_mode: 'Markdown'});
    }       
}