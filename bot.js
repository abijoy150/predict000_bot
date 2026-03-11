const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = "YOUR_NEW_TOKEN";

const bot = new TelegramBot(token, { polling: true });

const app = express();

let history = [];
let period = 0;
let interval = null;

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

    if(interval){
        bot.sendMessage(chatId,"Already running");
        return;
    }

    bot.sendMessage(chatId,"Prediction Started");

    interval = setInterval(()=>{

        period++;

        const result = predict();

        history.push(result);

        bot.sendMessage(chatId,period + " " + result);

    },30000);

});

bot.onText(/\/stop/, (msg) => {

    const chatId = msg.chat.id;

    clearInterval(interval);
    interval = null;

    bot.sendMessage(chatId,"Prediction Stopped");

});

bot.on('message',(msg)=>{

    const text = msg.text;
    const parts = text.split(" ");

    if(parts.length === 2){

        const p = parseInt(parts[0]);
        const r = parts[1];

        if(!isNaN(p) && (r=="Big" || r=="Small")){

            period = p;
            history.push(r);

        }
    }

});

app.get("/", (req,res)=>{
    res.send("Bot running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log("Server running");
});
