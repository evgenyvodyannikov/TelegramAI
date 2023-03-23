import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api';
dotenv.config();

// Env Variables
const token = process.env.TelegramToken;
const openaiApiKey = process.env.openaiApiKey;
const adminId = process.env.AdminId;

// Create the bot
const bot = new TelegramBot(token, {polling: true});

// Message Handlers

bot.on('message', (msg) => {

    let response = 'Received your message';
    if(msg.text == 'Penis' || msg.text == 'Пенис'){
        response = 'Да я люблю сосать член, это пенис'
    }

  const chatId = msg.chat.id;

  bot.sendMessage(chatId, response);

});

