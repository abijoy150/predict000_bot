const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = "8658261115:AAHFbcedXTWQdZEWVZEDqEm9ZJSt4GLvA_s";

const bot = new TelegramBot(token, { polling: true });

/* Render Port Fix */

const app = express();

app.get("/", (req,res)=>{
  res.send("Bot running");
});

app.listen(process.env.PORT || 3000, ()=>{
  console.log("Server running");
});


/* DATA */

let history = [];
let period = 0;
let interval = null;


/* PREDICTION FUNCTION */

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


/* START COMMAND */

bot.onText(/\/start/, (msg)=>{

  const chatId = msg.chat.id;

  if(interval){
    clearInterval(interval);
  }

  bot.sendMessage(chatId,"Prediction Started");

  /* First prediction instantly */

  period = period + 1;

  let result = predict();

  history.push(result);

  bot.sendMessage(chatId, period + " " + result);


  /* Then every 30 seconds */

  interval = setInterval(()=>{

    period = period + 1;

    let result = predict();

    history.push(result);

    bot.sendMessage(chatId, period + " " + result);

  },30000);

});


/* STOP COMMAND */

bot.onText(/\/stop/, (msg)=>{

  const chatId = msg.chat.id;

  if(interval){
    clearInterval(interval);
    interval = null;
  }

  bot.sendMessage(chatId,"Prediction Stopped");

});


/* MANUAL RESULT INPUT */

bot.on('message',(msg)=>{

  const text = msg.text;

  if(!text) return;

  const lines = text.split("\n");

  lines.forEach(line => {

    const parts = line.trim().split(" ");

    if(parts.length === 2){

      const p = parseInt(parts[0]);
      const r = parts[1].toLowerCase();

      if(!isNaN(p) && (r === "big" || r === "small")){

        period = p;

        history.push(r === "big" ? "Big" : "Small");

      }

    }

  });

});

console.log("Bot running...");
