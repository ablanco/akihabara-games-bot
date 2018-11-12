// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

'use strict';

const settings = require('./settings.js'),
    commands = require('./commands.js');

const TelegramBot = require('node-telegram-bot-api');

// TELEGRAM BOT ///////////////////////////////////////////////////////////////

const bot = new TelegramBot(settings.token, {polling: true});

// COMMANDS ///////////////////////////////////////////////////////////////////

const helpText = 'TODO';

bot.onText(/\/help.*/, function (msg) {
    bot.sendMessage(msg.from.id, helpText);
});

bot.onText(/\/ayuda.*/, function (msg) {
    bot.sendMessage(msg.from.id, helpText);
});

module.exports = bot;
