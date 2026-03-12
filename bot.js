const TelegramBot = require('node-telegram-bot-api');

const token = "8658261115:AAHFbcedXTWQdZEWVZEDqEm9ZJSt4GLvA_s";
const bot = new TelegramBot(token, { polling: true });

let period = null;
let history = [];
let timer = null;
let running = false;

function predict(){
  if(history.length < 3){
    return Math.random() < 0.5 ? "Big" : "Small";
  }

  const a = history[history.length-1];
  const b = history[history.length-2];
  const c = history[history.length-3];

  if(a === b && b === c){
    return a === "Big" ? "Small" : "Big";
  }

  return Math.random() < 0.5 ? "Big" : "Small";
}

bot.onText(/\/start/, (msg) => {

  const chatId = msg.chat.id;

  if(period === null){
    bot.sendMessage(chatId,"Send last result first.\nExample: 554 Big");
    return;
  }

  if(running){
    bot.sendMessage(chatId,"Already running");
    return;
  }

  running = true;

  if(timer){
    clearInterval(timer);
    timer = null;
  }

  bot.sendMessage(chatId,"Prediction Started");

  timer = setInterval(()=>{

    if(!running) return;

    period++;

    const result = predict();

    history.push(result);

    bot.sendMessage(chatId,period+" "+result);

  },30000);

});

bot.onText(/\/stop/, (msg)=>{

  const chatId = msg.chat.id;

  running = false;

  if(timer){
    clearInterval(timer);
    timer = null;
  }

  bot.sendMessage(chatId,"Prediction Stopped");

});

bot.on("message",(msg)=>{

  const text = msg.text;

  if(!text) return;
  if(text.startsWith("/")) return;

  const parts = text.split(" ");

  if(parts.length === 2){

    const p = parseInt(parts[0]);
    const r = parts[1];

    if(!isNaN(p) && (r==="Big" || r==="Small")){

      period = p;
      history.push(r);

    }

  }

});

console.log("Bot running...");
