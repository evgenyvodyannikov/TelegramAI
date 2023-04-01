import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import ChatGPTClient from "@waylaidwanderer/chatgpt-api";

dotenv.config();

// Env Variables
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const accessToken = process.env.OPENAI_ACCESS_TOKEN;
const telegramAdminId = process.env.TELEGRAM_ADMIN_ID;

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

let response;

// Create the bot
const bot = new TelegramBot(telegramToken, { polling: true });

// Message Handlers

bot.onText(/\/c reset/, (msg, match) => {

  const chatId = msg.chat.id;
  console.log(msg)
  if (chatId == telegramAdminId) {
    response = null;
    bot.sendMessage(chatId, "Dialog was reset successfully!");
  }
});

bot.on("message", async (msg) => {
  if (msg.text.indexOf("/c") < 0) {
    if (response) {
      response = await chatGptClient.sendMessage(msg.text, {
        conversationId: response.conversationId,
        parentMessageId: response.messageId,
      });
    } else {
      response = await chatGptClient.sendMessage(msg.text);
    }

    console.log(response);
    console.log(msg);

    const chatId = msg.chat.id;

    bot.sendMessage(chatId, response.response);
  }
});

// response = await chatGptClient.sendMessage("Hello!");
// console.log(response); // { response: 'Hello! How can I assist you today?', conversationId: '...', messageId: '...' }

// response = await chatGptClient.sendMessage("Write a short poem about cats.", {
//   conversationId: response.conversationId,
//   parentMessageId: response.messageId,
// });
// console.log(response.response); // Soft and sleek, with eyes that gleam,\nCats are creatures of grace supreme.\n...
// console.log();

// response = await chatGptClient.sendMessage("Now write it in French.", {
//   conversationId: response.conversationId,
//   parentMessageId: response.messageId,
//   // If you want streamed responses, you can set the `onProgress` callback to receive the response as it's generated.
//   // You will receive one token at a time, so you will need to concatenate them yourself.
//   onProgress: (token) => process.stdout.write(token),
// });
// console.log();
// console.log(response.response); // Doux et élégant, avec des yeux qui brillent,\nLes chats sont des créatures de grâce suprême.\n...

// response = await chatGptClient.sendMessage("Repeat my 2nd message verbatim.", {
//   conversationId: response.conversationId,
//   parentMessageId: response.messageId,
//   // If you want streamed responses, you can set the `onProgress` callback to receive the response as it's generated.
//   // You will receive one token at a time, so you will need to concatenate them yourself.
//   onProgress: (token) => process.stdout.write(token),
// });
// console.log();
// console.log(response.response); // "Write a short poem about cats."
