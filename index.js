import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import ChatGPTClient from "@waylaidwanderer/chatgpt-api";

dotenv.config();

//#region Env Variables
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const accessToken = process.env.OPENAI_ACCESS_TOKEN;
const telegramAdminId = process.env.TELEGRAM_ADMIN_ID;
const telegramUserId = process.env.TELEGRAM_USER_ID;
//#endregion

//#region ChatGPT Client Settings
const clientOptions = {
  modelOptions: {
    model: "gpt-3.5-turbo",
    temperature: 0,
  },
  // (Optional) Set custom instructions instead of "You are ChatGPT...".
  // promptPrefix: 'You are Bob, a cowboy in Western times...',
  // (Optional) Set a custom name for the user
  // userLabel: 'User',
  // (Optional) Set a custom name for ChatGPT
  // chatGptLabel: 'ChatGPT',
  // (Optional) Set to true to enable `console.debug()` logging
  debug: false,
};

const cacheOptions = {};

const chatGptClient = new ChatGPTClient(
  accessToken,
  clientOptions,
  cacheOptions
);

//#endregion

//#region Utility
let responses = [{ ChatId: null, Data: null }];
let isReady = true;

let accessAllowedUsers = [telegramAdminId, telegramUserId];

const checkPesmission = (userId) => {
  if (accessAllowedUsers.includes(String(userId))) {
    return true;
  }
  return false;
};
//#endregion

//#region Bot
const bot = new TelegramBot(telegramToken, { polling: true });

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

bot.onText(/\/random cat/, (msg) => {
  let url = `https://cataas.com/cat?${Date.now()}`; // To avoid Telegram sending the same picture because url the same
  bot.sendPhoto(msg.chat.id, url, {
    caption: "Here is your random cat!",
  });
});

bot.onText(/\/cat say(.+)/, async (msg, match) => {
  let catWords = match[1];
  let url = `https://cataas.com/cat/says/${catWords}`;
  bot.sendPhoto(msg.chat.id, url, {
    caption: "He said it!",
  });
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome to ChatGPT bot!", {
    reply_markup: {
      keyboard: [["/reset dialogue", "/random cat"], ["/help"]],
    },
  });
});

bot.onText(/\/help/, (msg) => {
  let help = `Welcome to ChatGPT bot!

Here is the list of available commands:
  
  1. random cat - Sends the image of a random cat
  2. cat say **{your text here}** - Sends the image of a random cat with specified label
  3. reset or reset dialogue - Resets current ChatGPT dialogue and allows to start new conversation
  4. sendMsg **{telegramId}|{request to ChatGPT}** - Sends request to ChatGPT and return response to specified telegram user
  5. start - Displays keyboard
    
To ask the question to ChatGPT just send some question to this chat. 

Example: What is pizza?`;

  bot.sendMessage(msg.chat.id, help, {
    parse_mode: "Markdown",
  });
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
