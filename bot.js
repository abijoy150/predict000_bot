const TelegramBot = require('node-telegram-bot-api');
const Tesseract = require('tesseract.js');
const fs = require('fs');

const token = "8658261115:AAHaU5Is9iXGPk664D5L53tK3qonFtEYY18";

const bot = new TelegramBot(token, { polling: true });

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
        bot.sendMessage(chatId,"Already Running");
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

    if(!text) return;

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

bot.on('photo', async (msg) => {

    const chatId = msg.chat.id;

    const fileId = msg.photo[msg.photo.length - 1].file_id;

    const file = await bot.getFileLink(fileId);

    const path = "image.jpg";

    const res = await fetch(file.href);
    const buffer = await res.arrayBuffer();

    fs.writeFileSync(path, Buffer.from(buffer));

    const result = await Tesseract.recognize(path,'eng');

    bot.sendMessage(chatId,"Detected Text:\n"+result.data.text);

});
