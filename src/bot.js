// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

'use strict';

const settings = require('./settings.js'),
    commands = require('./commands.js'),
    TelegramBot = require('node-telegram-bot-api'),
    _ = require('lodash');

// TELEGRAM BOT ///////////////////////////////////////////////////////////////

const bot = new TelegramBot(settings.token, {polling: true});

// COMMANDS ///////////////////////////////////////////////////////////////////

const helpText = 'Este bot... TODO';

bot.onText(/\/start.*/, function (msg) {
    bot.sendMessage(msg.from.id, helpText);
});

bot.onText(/\/ayuda.*/, function (msg) {
    bot.sendMessage(msg.from.id, helpText);
});

bot.onText(/\/nueva.*/, function (msg) {
    commands.newGameStart(bot, msg);
});

bot.onText(/\/lista.*/, function (msg) {
    commands.listGames(bot, msg);
});

bot.onText(/.*/, function (msg) {
    const code = _.get(msg, 'reply_to_message.text');

    if (!_.isUndefined(code)) {
        if (code[0] === 'n') {
            commands.newGameEnd(bot, msg);
        }
    }
});

bot.on('callback_query', function (msg) {
    commands.processCallback(bot, msg);
});

module.exports = bot;
