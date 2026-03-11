const TelegramBot = require('node-telegram-bot-api');

const token = "8658261115:AAHaU5Is9iXGPk664D5L53tK3qonFtEYY18";

const bot = new TelegramBot(token, { polling: true });

let period = 0;

bot.on('message', (msg) => {

const chatId = msg.chat.id;
const text = msg.text;

const parts = text.split(" ");

if(parts.length >= 2){

period = parseInt(parts[0]);

bot.sendMessage(chatId,"Prediction Started");

setInterval(() => {

period++;

const result = Math.random() < 0.5 ? "Big" : "Small";

bot.sendMessage(chatId, period + " " + result);

},30000);

}

});
