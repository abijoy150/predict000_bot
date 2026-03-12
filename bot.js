const TelegramBot = require('node-telegram-bot-api');

const token = "8658261115:AAHFbcedXTWQdZEWVZEDqEm9ZJSt4GLvA_s";

const bot = new TelegramBot(token, { polling: true });

bot.deleteWebHook();

let running = false;
let interval = null;

let history = [];
let period = 0;

function analyze(){

if(history.length < 3){
return Math.random() > 0.5 ? "Big" : "Small";
}

let last = history.slice(-3);

let big = last.filter(x => x=="Big").length;
let small = last.filter(x => x=="Small").length;

if(big > small) return "Small";
if(small > big) return "Big";

return Math.random() > 0.5 ? "Big" : "Small";

}

function sendPrediction(chatId){

let result = analyze();

period++;

bot.sendMessage(chatId, `${period} ${result}`);

history.push(result);

}

function startLoop(chatId){

if(interval){
clearInterval(interval);
}

interval = setInterval(()=>{

if(!running) return;

sendPrediction(chatId);

},30000);

}

bot.onText(/\/start/, (msg)=>{

const chatId = msg.chat.id;

if(running){
bot.sendMessage(chatId,"Already Running");
return;
}

running = true;

bot.sendMessage(chatId,"Prediction Started");

sendPrediction(chatId);

startLoop(chatId);

});

bot.onText(/\/stop/, (msg)=>{

const chatId = msg.chat.id;

running = false;

if(interval){
clearInterval(interval);
interval = null;
}

bot.sendMessage(chatId,"Prediction Stopped");

});

bot.on('message',(msg)=>{

const chatId = msg.chat.id;

const text = msg.text;

if(!text) return;

if(text.startsWith("/")) return;

let lines = text.split("\n");

history = [];

lines.forEach(line=>{

let parts = line.trim().split(" ");

if(parts.length==2){

let p = parseInt(parts[0]);

let r = parts[1];

if(!isNaN(p)){

period = p;

history.push(r);

}

}

});

});
