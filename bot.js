const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const token = process.env.BOT_TOKEN || "8658261115:AAHFbcedXTWQdZEWVZEDqEm9ZJSt4GLvA_s";
const bot = new TelegramBot(token, { polling: true });

// ---- Keep-alive web server (for Render + UptimeRobot ping) ----
const app = express();
app.get("/", (req, res) => res.send("Bot is running"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Web server started on " + PORT));

// ---- Bot state ----
let running = false;
let interval = null;
let history = [];
let period = 0;

// Normalize Big/Small
function norm(v) {
  if (!v) return null;
  v = v.toLowerCase();
  if (v === "big") return "Big";
  if (v === "small") return "Small";
  return null;
}

// Simple analysis (last 4 results)
function analyze() {
  if (history.length < 4) {
    return Math.random() > 0.5 ? "Big" : "Small";
  }
  const last = history.slice(-4);
  const big = last.filter(x => x === "Big").length;
  const small = last.filter(x => x === "Small").length;

  if (big > small) return "Small";
  if (small > big) return "Big";
  return Math.random() > 0.5 ? "Big" : "Small";
}

function sendPrediction(chatId) {
  const result = analyze();
  period += 1;
  bot.sendMessage(chatId, `${period} ${result}`);
  history.push(result);
}

function startLoop(chatId) {
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    if (!running) return;
    sendPrediction(chatId);
  }, 30000); // 30 seconds
}

// ---- Commands ----
bot.onText(/\/start/i, (msg) => {
  const chatId = msg.chat.id;
  if (running) {
    bot.sendMessage(chatId, "Already running.");
    return;
  }
  running = true;
  bot.sendMessage(chatId, "Prediction Started");
  sendPrediction(chatId);     // first result instantly
  startLoop(chatId);          // then every 30s
});

bot.onText(/\/stop/i, (msg) => {
  const chatId = msg.chat.id;
  running = false;
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  bot.sendMessage(chatId, "Prediction Stopped");
});

// ---- History input handler ----
bot.on("message", (msg) => {
  const text = msg.text;
  if (!text || text.startsWith("/")) return;

  const lines = text.split("\n");
  history = [];
  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 2) {
      const p = parseInt(parts[0]);
      const r = norm(parts[1]);
      if (!isNaN(p) && r) {
        period = p;
        history.push(r);
      }
    }
  });
});
