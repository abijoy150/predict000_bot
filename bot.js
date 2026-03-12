const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = "8658261115:AAHFbcedXTWQdZEWVZEDqEm9ZJSt4GLvA_s";
const bot = new TelegramBot(token,{ polling:true });

let running = false;

let data = {
  period:null,
  history:[]
};

if(fs.existsSync("data.json")){
  data = JSON.parse(fs.readFileSync("data.json"));
}

function save(){
  fs.writeFileSync("data.json",JSON.stringify(data));
}

function analyzeTrend(){

  const last = data.history.slice(-10);

  let big = last.filter(x=>x==="Big").length;
  let small = last.filter(x=>x==="Small").length;

  if(big > small) return "Small";
  if(small > big) return "Big";

  return Math.random() < 0.5 ? "Big" : "Small";
}

async function loop(chatId){

  while(running){

    await new Promise(r=>setTimeout(r,30000));

    if(!running) break;

    data.period++;

    const prediction = analyzeTrend();

    bot.sendMessage(chatId,
      "Period: "+data.period+
      "\nPrediction: "+prediction
    );
  }

}

bot.onText(/\/start/, msg=>{

  const chatId = msg.chat.id;

  if(data.period === null){
    bot.sendMessage(chatId,"Send last result first\nExample: 554 Big");
    return;
  }

  if(running){
    bot.sendMessage(chatId,"Already running");
    return;
  }

  running = true;

  bot.sendMessage(chatId,"Prediction started");

  loop(chatId);

});

bot.onText(/\/stop/, msg=>{

  running = false;

  bot.sendMessage(msg.chat.id,"Prediction stopped");

});

bot.on("message", msg=>{

  const text = msg.text;

  if(!text) return;
  if(text.startsWith("/")) return;

  const parts = text.split(" ");

  if(parts.length === 2){

    const p = parseInt(parts[0]);
    const r = parts[1];

    if(!isNaN(p) && (r==="Big" || r==="Small")){

      data.period = p;
      data.history.push(r);

      save();
    }

  }

});

console.log("Bot running...");
