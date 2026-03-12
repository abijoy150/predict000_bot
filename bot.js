const TelegramBot = require("node-telegram-bot-api")

const token = "8658261115:AAHFbcedXTWQdZEWVZEDqEm9ZJSt4GLvA_s"

const bot = new TelegramBot(token,{polling:true})

let period = 20260312100052468
let running = false
let interval = null

function randomResult(){
return Math.random() < 0.5 ? "Big" : "Small"
}

function sendResult(chatId){

period++

let result = randomResult()

bot.sendMessage(chatId,`${period} ${result}`)

}

function startLoop(chatId){

if(interval){
clearInterval(interval)
}

interval = setInterval(()=>{

if(!running) return

sendResult(chatId)

},30000)

}

bot.onText(/\/start/,msg=>{

const chatId = msg.chat.id

running = true

bot.sendMessage(chatId,"Prediction Started")

sendResult(chatId)

startLoop(chatId)

})

bot.onText(/\/stop/,msg=>{

running = false

if(interval){
clearInterval(interval)
interval = null
}

bot.sendMessage(msg.chat.id,"Prediction Stopped")

})
