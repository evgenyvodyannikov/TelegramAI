# Telegram bot with integrated ChatGPT

This repository contains the code for a Telegram bot that allows users to ask questions and receive answers from ChatGPT.

The bot is built using the NodeJs and relies on the [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) and the [node-chatgpt-api](https://github.com/waylaidwanderer/node-chatgpt-api) Github projects.

### **Topics**:

1. [Usage](#usage)
2. [Commands](#commands)
3. [Uptime](#uptime)

### **Usage**

To use the bot, simply send your question to the chat and wait for the answer!

<p align="center">
  <img src="https://raw.githubusercontent.com/evgenyvodyannikov/telegramai/master/public/img/Conversation.png">
</p>

Keep in mind that ChatGPT needs some time to process your question, so be patient

<p align="center">
  <img src="https://raw.githubusercontent.com/evgenyvodyannikov/telegramai/master/public/img/Pending.png">
</p>

After getting answer from ChatGPT, last message (in our case - 'Loading...') is deleting and you get new message notification from Telegram

<p align="center">
  <img src="https://raw.githubusercontent.com/evgenyvodyannikov/telegramai/master/public/img/Result.png">
</p>

### **Commands**

Here is the list of currently available commands:

1. `/start` or `/help` - show information about Bot to the user
2. `/reset` or `/reset dialogue` - reset current conversation cache, allow to start new dialogue to ChatGPT

<p align="center">
  <img src="https://raw.githubusercontent.com/evgenyvodyannikov/telegramai/master/public/img/ResetDialogue.png">
</p>

3. `/random cat` or `/random capybara` - send to chat random photo of specified animal (only cats and capybaras for now)

<p align="center">
  <img src="https://raw.githubusercontent.com/evgenyvodyannikov/telegramai/master/public/img/RandomCat.png">
</p>

4. `/sendMsg` **user_id** | **your_prompt** - send your prompt to ChatGPT as a question, returned answer will be send to the specified user and you too

### **Uptime**

Bot is starting in local environment so working hours may vary from 9:00 to 02:00 (UTC+5)