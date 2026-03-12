const TelegramBot = require("node-telegram-bot-api")
const express = require("express")
const Tesseract = require("tesseract.js")
const fs = require("fs")

const token = "8658261115:AAHFbcedXTWQdZEWVZEDqEm9ZJSt4GLvA_s"

const bot = new TelegramBot(token,{polling:true})

const app = express()

app.get("/",(req,res)=>{
res.send("Bot Running")
})

app.listen(process.env.PORT || 3000)

let history=[]
let period=0
let running=false
let interval=null

function analyze(){

if(history.length<4){
return Math.random()>0.5?"Big":"Small"
}

let last=history.slice(-4)

let big=last.filter(x=>x=="Big").length
let small=last.filter(x=>x=="Small").length

if(big>small) return "Small"
if(small>big) return "Big"

return Math.random()>0.5?"Big":"Small"

}

function sendPrediction(chatId){

let result=analyze()

period++

bot.sendMessage(chatId,`${period} ${result}`)

history.push(result)

}

function startLoop(chatId){

if(interval){
clearInterval(interval)
}

interval=setInterval(()=>{

if(!running) return

sendPrediction(chatId)

},30000)

}

bot.onText(/\/start/i,msg=>{

const chatId=msg.chat.id

running=true

bot.sendMessage(chatId,"Prediction Started")

sendPrediction(chatId)

startLoop(chatId)

})

bot.onText(/\/stop/i,msg=>{

running=false

if(interval){
clearInterval(interval)
interval=null
}

bot.sendMessage(msg.chat.id,"Prediction Stopped")

})

/* Screenshot reader */

bot.on("photo",async msg=>{

const chatId=msg.chat.id

const fileId=msg.photo[msg.photo.length-1].file_id

const file=await bot.getFile(fileId)

const url=`https://api.telegram.org/file/bot${token}/${file.file_path}`

const filePath="image.jpg"

const response=await fetch(url)
const buffer=await response.arrayBuffer()

fs.writeFileSync(filePath,Buffer.from(buffer))

Tesseract.recognize(filePath,"eng").then(result=>{

let text=result.data.text

console.log(text)

let lines=text.split("\n")

lines.forEach(line=>{

if(line.includes("Big")||line.includes("Small")){

let parts=line.trim().split(" ")

let p=parseInt(parts[0])

let r=parts[1]

if(!isNaN(p)){

period=p
history.push(r)

}

}

})

bot.sendMessage(chatId,"Screenshot analyzed")

})

})
