const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const TOKEN = "8658261115:AAHFbcedXTWQdZEWVZEDqEm9ZJSt4GLvA_s";

const bot = new TelegramBot(TOKEN, { polling: true });

/* Render server */

const app = express();

app.get("/", (req, res) => {
  res.send("Bot running");
});

app.listen(process.env.PORT || 3000);


/* DATA */

let running = false;
let interval = null;
let period = 0;
let history = [];


/* prediction */

function predict() {

  if (history.length < 3) {
    return Math.random() < 0.5 ? "Big" : "Small";
  }

  const a = history[history.length - 1];
  const b = history[history.length - 2];
  const c = history[history.length - 3];

  if (a === b && b === c) {
    return a === "Big" ? "Small" : "Big";
  }

  return Math.random() < 0.5 ? "Big" : "Small";
}


/* send prediction */

function sendPrediction(chatId) {

  period++;

  const result = predict();

  history.push(result);

  bot.sendMessage(chatId, period + " " + result);

}


/* START */

bot.onText(/\/start/, (msg) => {

  const chatId = msg.chat.id;

  if (running) {
    bot.sendMessage(chatId, "Already running");
    return;
  }

  running = true;

  bot.sendMessage(chatId, "Prediction started");

  sendPrediction(chatId);

  interval = setInterval(() => {

    if (!running) return;

    sendPrediction(chatId);

  }, 30000);

});


/* STOP */

bot.onText(/\/stop/, (msg) => {

  const chatId = msg.chat.id;

  running = false;

  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  bot.sendMessage(chatId, "Prediction stopped");

});


/* manual input */

bot.on("message", (msg) => {

  const text = msg.text;

  if (!text) return;

  if (text.startsWith("/")) return;

  const lines = text.split("\n");

  lines.forEach(line => {

    const parts = line.trim().split(" ");

    if (parts.length === 2) {

      const p = parseInt(parts[0]);
      const r = parts[1].toLowerCase();

      if (!isNaN(p) && (r === "big" || r === "small")) {

        period = p;

        history.push(r === "big" ? "Big" : "Small");

      }

    }

  });

});
