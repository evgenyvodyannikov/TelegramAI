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
let response;
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

bot.onText(/\/reset/, (msg, match) => {
  const chatId = msg.chat.id;
  if (checkPesmission(chatId)) {
    response = null;
    bot.sendMessage(chatId, "Dialog was reset successfully!");
  }
});

bot.onText(/\/sendMsg (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (isReady && checkPesmission(chatId)) {
    isReady = false;
    let query = match[1];
    let userId = query.substring(0, query.indexOf("|"));
    let message = query.substring(query.indexOf("|") + 1, query.length).trim();
    bot.sendMessage(telegramAdminId, "Generating response");
    response = await chatGptClient.sendMessage(message);
    bot.sendMessage(userId, response.response);
    bot.sendMessage(telegramAdminId, "Success.");
    response = null;
    isReady = true;
  }
});

bot.onText(/\/sendpic/, (msg) => {
  bot.sendPhoto(
    msg.chat.id,
    "https://sun9-77.userapi.com/impg/klcqWtISQK1oxuoR7aIK9gEP2ET82hYGyP0NwQ/xBIyFUcdg5o.jpg?size=397x470&quality=95&sign=4d5c5e1fa23583bb4e5805c0739231db&type=album",
    { caption: "Бля! \nЯ со смены! " }
  );
});

bot.onText(/\/keyboard/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome", {
    reply_markup: {
      keyboard: [["/sendpic", "Hello, Chat!"], ["/keyboard"]],
    },
  });
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (isReady && msg.text.indexOf("/") != 0 && checkPesmission(chatId)) {
    bot.sendMessage(chatId, "Generating response");
    isReady = false;

    if (response) {
      response = await chatGptClient.sendMessage(msg.text, {
        conversationId: response.conversationId,
        parentMessageId: response.messageId,
      });
    } else {
      response = await chatGptClient.sendMessage(msg.text);
    }

    bot.sendMessage(chatId, response.response);
    isReady = true;
  }
});

//#endregion
