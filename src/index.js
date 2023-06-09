import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { KeyvFile } from "keyv-file";
import ChatGPTClient from "@waylaidwanderer/chatgpt-api";
import {init, getUsers} from './controllers/postgreSQL.js'

dotenv.config();

//#region Env Variables
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const accessToken = process.env.OPENAI_ACCESS_TOKEN;
//#endregion

//#region PostgreSQL
await init();

const users = await getUsers();
console.log(users);
//#endregion

//#region ChatGPT Client Settings
const clientOptions = {
  modelOptions: {
    model: "gpt-3.5-turbo",
    temperature: 0,
  },
  debug: false,
};

const cacheOptions = {
  store: new KeyvFile({ filename: "cache.json" }),
};

const chatGptClient = new ChatGPTClient(
  accessToken,
  clientOptions,
  cacheOptions
);

//#endregion

//#region Utility
let responses = [{ ChatId: null, Data: null }];
let isReady = true;
let welcomeMessage =
  "Welcome to ChatGPT bot!\n\n" +
  "You can find the list of available commands here:\n" +
  "[GitHub.com](https://github.com/evgenyvodyannikov/TelegramAI)\n\n" +
  "To ask the question to ChatGPT just send some text to this chat, for example: *What is pizza?*";

const checkPesmission = (userId) => {
  return users.filter(item => item.telegram_id == userId).length > 0;
};
//#endregion

//#region Bot
const bot = new TelegramBot(telegramToken, { polling: true });

//#region Administrative Funcs
bot.onText(/\/reset/, (msg) => {
  const chatId = msg.chat.id;
  if (checkPesmission(chatId)) {
    let currentCoversation = responses.filter(
      (response) => response.ChatId == chatId
    )[0];
    if (currentCoversation) {
      currentCoversation.Data = null;
    }
    bot.sendMessage(chatId, "Dialogue was reset successfully!");
  }
});

bot.onText(/\/users/, (msg) => {
  const chatId = msg.chat.id;
  if (checkPesmission(chatId)) {
    let users = accessAllowedUsers.join("\n");
    bot.sendMessage(chatId, users, {
      parse_mode: "Markdown",
    });
  }
});

bot.onText(/\/sendMsg (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (isReady && checkPesmission(chatId)) {
    isReady = false;

    let query = match[1];
    let userId = query.substring(0, query.indexOf("|"));
    let message = query.substring(query.indexOf("|") + 1, query.length).trim();

    let loadingMsgId = 0;

    await bot
      .sendMessage(telegramAdminId, "Generating response")
      .then((result) => (loadingMsgId = result.message_id));

    let resData = await chatGptClient.sendMessage(message);
    bot.sendMessage(userId, resData.response);
    bot.deleteMessage(chatId, loadingMsgId);
    bot.sendMessage(chatId, resData.response);
    isReady = true;
  }
});
//#endregion

//#region Cats&Capybaras
bot.onText(/\/random cat/, (msg) => {
  let url = `https://cataas.com/cat?${Date.now()}`; // To avoid Telegram sending the same picture because url the same
  bot.sendPhoto(msg.chat.id, url, {
    caption: "Here is your random cat!",
  });
});

bot.onText(/\/random capybara/, (msg) => {
  let url = `https://api.capy.lol/v1/capybara?${Date.now()}`; // To avoid Telegram sending the same picture because url the same
  bot.sendPhoto(msg.chat.id, url, {
    caption: "Here is your random capybara!",
  });
});

bot.onText(/\/cat say(.+)/, async (msg, match) => {
  let catWords = match[1];
  let url = `https://cataas.com/cat/says/${catWords}`;
  bot.sendPhoto(msg.chat.id, url, {
    caption: "He said it!",
  });
});
//#endregion

//#region Start&Help
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, welcomeMessage, {
    reply_markup: {
      keyboard: [
        ["/reset dialogue", "/help"],
        ["/random cat", "/random capybara"],
      ],
    },
    parse_mode: "Markdown",
  });
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, welcomeMessage, {
    parse_mode: "Markdown",
  });
});
//#endregion

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (isReady && msg.text.indexOf("/") != 0 && checkPesmission(chatId)) {
    let loadingMsgId = 0;
    await bot
      .sendMessage(chatId, "Loading...")
      .then((result) => (loadingMsgId = result.message_id));
    isReady = false;

    let currentUserRes = responses.filter(
      (response) => response.ChatId == chatId
    )[0];
    if (currentUserRes?.Data) {
      currentUserRes.Data = await chatGptClient.sendMessage(msg.text, {
        conversationId: currentUserRes.Data.conversationId,
        parentMessageId: currentUserRes.Data.messageId,
      });
    } else {
      let newRes = await chatGptClient.sendMessage(msg.text);
      let index = responses.push({ ChatId: chatId, Data: newRes });
      currentUserRes = responses[index - 1];
    }
    bot.deleteMessage(chatId, loadingMsgId);
    //bot.editMessageText(response.response, {chat_id: chatId, message_id: loadingMsgId})
    bot.sendMessage(chatId, currentUserRes.Data.response, {
      parse_mode: "Markdown",
    });
    isReady = true;
  }
});

//#endregion
