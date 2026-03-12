const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = "8658261115:AAHFbcedXTWQdZEWVZEDqEm9ZJSt4GLvA_s";

const bot = new TelegramBot(token,{polling:true});

/* Render Port Fix */

const app = express();

app.get("/",(req,res)=>{
res.send("Bot Running");
});

app.listen(process.env.PORT || 3000,()=>{
console.log("Server Running");
});


/* DATA */

let history = [];
let period = 0;
let running = false;
let interval = null;


/* ANALYSIS FUNCTION */

function predict(){

if(history.length < 3){
return Math.random() < 0.5 ? "Big" : "Small";
}

let a = history[history.length-1];
let b = history[history.length-2];
let c = history[history.length-3];

if(a===b && b===c){
return a==="Big" ? "Small":"Big";
}

return Math.random() < 0.5 ? "Big":"Small";

}


/* START */

bot.onText(/\/start/,msg=>{

let chatId = msg.chat.id;

if(running){
bot.sendMessage(chatId,"Prediction Already Running");
return;
}

running = true;

bot.sendMessage(chatId,"Prediction Started");


/* First Result */

period++;

let result = predict();

history.push(result);

bot.sendMessage(chatId,period+" "+result);


/* Loop */

interval = setInterval(()=>{

if(!running) return;

period++;

let result = predict();

history.push(result);

bot.sendMessage(chatId,period+" "+result);

},30000);

});


/* STOP */

bot.onText(/\/stop/,msg=>{

let chatId = msg.chat.id;

running = false;

if(interval){
clearInterval(interval);
interval = null;
}

bot.sendMessage(chatId,"Prediction Stopped");

});


/* MANUAL RESULT INPUT */

bot.on('message',msg=>{

let text = msg.text;

if(!text) return;

if(text.startsWith("/")) return;

let lines = text.split("\n");

lines.forEach(line=>{

let parts = line.trim().split(" ");

if(parts.length === 2){

let p = parseInt(parts[0]);

let r = parts[1].toLowerCase();

if(!isNaN(p) && (r==="big" || r==="small")){

period = p;

history.push(r==="big" ? "Big":"Small");

}

}

});

});


console.log("Bot Started");
